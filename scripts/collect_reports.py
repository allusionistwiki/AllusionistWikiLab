#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tally + EchoThread 報告回収 → GitHub Issue 化（Lab）。

- Tally: GET https://api.tally.so/forms/{form}/submissions (Bearer token, ローカルシークレットファイル)
- EchoThread: 公開 embed API（サイト公開鍵で読める）: embed/thread → embed/comments
- 新規項目のみ GitHub Issue 化（reject テンプレ準拠の本文、label: triage）。
  llm-task ラベルは人間が後付け（匿名入力の自動実装はプロンプトインジェクションリスク）。
- 状態: scratch/collect_state.json（処理済み ID 集合）。
- 使い方: python collect_reports.py [--dry-run]
"""
import json
import os
import sys
import urllib.parse
import urllib.request

REPO = "allusionistwiki/AllusionistWikiLab"
SITE = "https://allusionistwiki.github.io/AllusionistWikiLab"
CONTENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "content")
TALLY_FORM = "EqzzbX"
# Tally 項目 groupUuid（公開ページの __NEXT_DATA__ より）
TALLY_FIELDS = {
    "url": "a0659441-65e2-42f0-bd02-ae3b38fce727",
    "claim": "aeefdcba-84c6-4bcf-b5cc-6e323b865798",
    "kind": "2527590b-f316-4906-a76d-57bcf809a930",
    "reason": "11805aaa-5382-452f-b2ce-ca56040a0a97",
    "source": "03050667-c788-4abb-bd16-69c70af69d8a",
    "name": "c448803b-239b-4e82-ad95-2bab15cd3524",
    "email": "eccf741b-ba33-4133-8c3f-1cc468bb060f",
}
TALLY_KINDS = {
    "f854c082-aed9-4cc8-ac14-66f2b63525cc": "reject（記述の削除・降格要求）",
    "bc4b47cd-70ab-46ee-a413-a65f0c468713": "事実誤り（原文と矛盾）",
    "a62d97b9-56e2-4bcb-9373-7ed40b022845": "編集提案",
    "ff2217fb-7993-4a69-9355-b27348b54054": "情報提供（典拠付き）",
}
SCRATCH = r"C:/Users/d5dx/AppData/Local/hermes/profiles/awiki2/cache/scratch"
STATE_FILE = os.path.join(SCRATCH, "collect_state.json")
TALLY_TOKEN_FILE = os.path.join(SCRATCH, "tallytok.txt")
GH_TOKEN_FILE = os.path.join(SCRATCH, "ghtok.txt")
ECHO_KEY_FILE = os.path.join(SCRATCH, "echokey.txt")


def http_json(url, headers=None, data=None, method=None):
    h = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
         "Accept": "application/json"}
    h.update(headers or {})
    req = urllib.request.Request(url, headers=h, data=data, method=method)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"echo": [], "tally": []}


def save_state(st):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(st, f, ensure_ascii=False, indent=1)


def lab_pages():
    slugs = []
    base = os.path.abspath(CONTENT_DIR)
    for root, _dirs, files in os.walk(base):
        for fn in files:
            if fn.endswith(".md"):
                rel = os.path.relpath(os.path.join(root, fn), base)
                slug = rel[:-3].replace("\\", "/")
                if slug == "index" or slug.endswith("/index"):
                    slug = slug.rsplit("/index", 1)[0]
                slugs.append(slug)
    return [s for s in slugs if s]


def echo_fetch_comments(key, slugs):
    out = []
    for slug in slugs:
        page_url = f"{SITE}/{slug}"
        q = urllib.parse.urlencode({"identifier": slug, "page_url": page_url, "api_key": key})
        try:
            th = http_json(f"https://api.echothread.io/api/v1/embed/thread?{q}")
        except Exception as e:
            print(f"[echo] thread skip {slug}: {e}")
            continue
        tid = (th.get("thread") or {}).get("id") or th.get("id")
        if not tid:
            continue
        q2 = urllib.parse.urlencode(
            {"thread_id": tid, "page": 1, "page_size": 50, "sort": "newest", "api_key": key}
        )
        try:
            cm = http_json(f"https://api.echothread.io/api/v1/embed/comments?{q2}")
        except Exception as e:
            print(f"[echo] comments skip {slug}: {e}")
            continue
        for c in cm.get("comments", []):
            out.append({
                "id": str(c.get("id")),
                "slug": slug,
                "page_url": page_url,
                "author": c.get("author_name") or c.get("name") or "匿名",
                "body": c.get("body") or c.get("content") or "",
                "created": c.get("created_at") or c.get("createdAt") or "",
            })
    return out


def tally_fetch_submissions(token):
    if not token:
        return None
    h = {"Authorization": f"Bearer {token}"}
    base = f"https://api.tally.so/forms/{TALLY_FORM}/submissions"
    d = http_json(base, headers=h)
    qmap = {}  # questionId -> title
    for q in d.get("questions", []):
        qmap[q.get("id")] = q.get("title")
    out = []
    for s in d.get("submissions", []):
        sid = str(s.get("id"))
        det = http_json(f"{base}/{sid}", headers=h).get("submission", {})
        ans = {}
        for r in det.get("responses", []):
            title = qmap.get(r.get("questionId"), "")
            a = r.get("answer")
            if isinstance(a, list):
                a = "・".join(str(x) for x in a)
            ans[title] = str(a) if a is not None else ""
        kind = ans.get("種別", "")
        out.append({
            "id": sid,
            "url": ans.get("対象ページの URL", ""),
            "claim": ans.get("対象の主張 ID", ""),
            "kind": kind,
            "reason": ans.get("理由", ""),
            "source": ans.get("根拠・出典", ""),
            "name": ans.get("名前", ""),
            "email": ans.get("メール", ""),
            "created": det.get("submittedAt") or det.get("createdAt", ""),
        })
    return out


def gh_graphql(token, query, variables=None):
    payload = json.dumps({"query": query, "variables": variables or {}}).encode()
    d = http_json(
        "https://api.github.com/graphql",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        data=payload,
        method="POST",
    )
    if "errors" in d:
        raise RuntimeError(json.dumps(d["errors"])[:200])
    return d["data"]


def gh_discussion_map(token):
    """giscus 対応: スレッド title == pathname（例 AllusionistWikiLab/claims/sample-claim）。"""
    data = gh_graphql(
        token,
        'query { repository(owner: "allusionistwiki", name: "AllusionistWikiLab") {'
        " discussions(first: 100) { nodes { number title } } } }",
    )
    return {n["title"]: n["number"] for n in data["repository"]["discussions"]["nodes"]}


def gh_mirror_comment(token, disc_number, body):
    # Discussions は REST API（GraphQL addComment は Discussion を解決できない）
    http_json(
        f"https://api.github.com/repos/{REPO}/discussions/{disc_number}/comments",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        data=json.dumps({"body": body}).encode(),
        method="POST",
    )


def make_issue(gh_token, title, body, labels):
    if not gh_token:
        print("[issue] no gh token, skip:", title)
        return False
    payload = json.dumps({"title": title, "body": body, "labels": labels}).encode()
    http_json(
        f"https://api.github.com/repos/{REPO}/issues",
        headers={
            "Authorization": f"Bearer {gh_token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "allusionistwiki-collector",
        },
        data=payload,
        method="POST",
    )
    return True


def main():
    dry = "--dry-run" in sys.argv
    st = load_state()
    gh_token = open(GH_TOKEN_FILE, encoding="utf-8").read().strip() if os.path.exists(GH_TOKEN_FILE) else ""
    echo_key = open(ECHO_KEY_FILE, encoding="utf-8").read().strip() if os.path.exists(ECHO_KEY_FILE) else ""
    tally_token = open(TALLY_TOKEN_FILE, encoding="utf-8").read().strip() if os.path.exists(TALLY_TOKEN_FILE) else ""

    created = 0

    # EchoThread
    if echo_key:
        seen_issue = set(st["echo"])
        seen_mirror = set(st.get("echo_mirror", []))
        disc_map = gh_discussion_map(gh_token) if gh_token else {}
        for c in echo_fetch_comments(echo_key, lab_pages()):
            if c["id"] not in seen_issue:
                title = f"[{c['slug']}] EchoThread 報告"
                body = (
                    f"対象ページ: {c['page_url']}\n"
                    f"URL: {c['page_url']}\n"
                    f"投稿者: {c['author']}（EchoThread / 匿名投稿の可能性あり）\n"
                    f"日時: {c['created']}\n\n"
                    f"## 内容\n\n{c['body']}\n\n"
                    "（Tally/EchoThread 回収による自動起票。種別『編集提案』は llm-task 自動付与で実装経路へ。他種別は triage 後に人間トリアージ）"
                )
                print("[echo] new:", c["id"], c["slug"], c["body"][:60].replace("\n", " "))
                if not dry:
                    make_issue(gh_token, title, body, ["triage"])
                st["echo"].append(c["id"])
                created += 1
            # giscus バックアップミラー（Discussions、表示は EchoThread のみ）
            if c["id"] not in seen_mirror:
                disc_id = disc_map.get(f"AllusionistWikiLab/{c['slug']}")
                if disc_id:
                    mbody = (
                        f"EchoThread ミラー（バックアップ）— 投稿者: {c['author']} / {c['created']}\n\n"
                        f"{c['body']}"
                    )
                    print("[mirror]", c["slug"], "-> disc", disc_id)
                    if not dry:
                        try:
                            gh_mirror_comment(gh_token, disc_id, mbody)
                            st.setdefault("echo_mirror", []).append(c["id"])
                        except Exception as e:
                            print("[mirror] fail:", e)
                else:
                    print("[mirror] no giscus thread for", c["slug"])

    # Tally
    subs = tally_fetch_submissions(tally_token)
    if subs is None:
        print("[tally] token 無し: スキップ（tallytok.txt 必要）")
    else:
        seen = set(st["tally"])
        for s in subs:
            if s["id"] in seen:
                continue
            title = f"[{s['url'].rsplit('/', 1)[-1] or 'form'}] {s['kind'] or '報告'}"
            body = (
                f"対象ページ: {s['url']}\n"
                f"URL: {s['url']}\n"
                f"対象 claim / 伏線 ID: {s['claim']}\n"
                f"種別: {s['kind']}\n"
                f"名前: {s['name']} / メール: {s['email']}\n"
                f"日時: {s['created']}\n\n"
                f"## 理由\n\n{s['reason']}\n\n"
                f"## 典拠\n\n{s['source']}\n\n"
                "（Tally 回収による自動起票。種別『編集提案』は llm-task 自動付与で実装経路へ。他種別は triage 後に人間トリアージ）"
            )
            print("[tally] new:", s["id"], s["kind"], s["reason"][:60].replace("\n", " "))
            labels = ["triage"]
            if s["kind"] == "編集提案":
                labels.append("llm-task")
            if not dry:
                make_issue(gh_token, title, body, labels)
            st["tally"].append(s["id"])
            created += 1

    if not dry:
        save_state(st)
    print(f"done. new={created} dry={dry}")


if __name__ == "__main__":
    main()
