#!/usr/bin/env python3
"""Post-merge audit for AllusionistWikiLab.

Usage: audit_pr.py <merge_sha>
Prints GITHUB_OUTPUT lines:
  verdict=PASS|REJECT
  reason=<one line>

Layers:
  1. deterministic heuristics (reuses scripts/pr_gate_checks.py on the merged diff)
  2. optional LLM (OpenAI-compatible endpoint, e.g. local Strata llama.cpp server)
     via env STRATA_API_URL / STRATA_API_KEY / STRATA_MODEL.
     SPAM -> REJECT. NEEDS_HUMAN -> PASS with reason logged (human override stays
     the top authority; audit never blocks, only flags).
"""
import json
import os
import subprocess
import sys
import urllib.request


def sh(cmd: str) -> str:
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout


def main() -> int:
    sha = sys.argv[1]
    stat = sh(f"git show {sha} -m --first-parent --stat")[:2000]
    diff = sh(f"git show {sha} -m --first-parent --patch")[:20000]

    out = sh(f"python3 scripts/pr_gate_checks.py {sha}^1 {sha}")
    verdict, reason = "PASS", "heuristic ok"
    for line in out.splitlines():
        if line.startswith("verdict="):
            verdict = line.split("=", 1)[1]
        elif line.startswith("reasons=") and line[len("reasons="):].strip():
            reason = line[len("reasons="):].strip()

    api = os.environ.get("STRATA_API_URL")
    if api and verdict != "FAIL":
        prompt = (
            "あなたは Wiki 監査ボットです。ファン解析 Wiki の git diff を判定してください。"
            "出力は 1 行のみ: PASS / SPAM / NEEDS_HUMAN のいずれかと、日本語の理由 1 文。"
            "SPAM=荒らし・広告・破壊・意味不明。NEEDS_HUMAN=灰色地带で人間判断が望ましい。"
            "PASS=建設的な編集。\n\n"
            f"STAT:\n{stat}\n\nDIFF:\n{diff}"
        )
        body = {
            "model": os.environ.get("STRATA_MODEL", "audit"),
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 160,
        }
        req = urllib.request.Request(
            api.rstrip("/") + "/chat/completions",
            data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json"},
        )
        key = os.environ.get("STRATA_API_KEY")
        if key:
            req.add_header("Authorization", "Bearer " + key)
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                resp = json.loads(r.read().decode())
            text = resp["choices"][0]["message"]["content"].strip()
        except Exception as exc:  # endpoint unreachable -> heuristic verdict stands
            text = "PASS api_error " + str(exc)[:80]
        if text.startswith("SPAM"):
            verdict = "FAIL"
            reason = "LLM: " + text[:200]
        elif text.startswith("NEEDS_HUMAN"):
            reason = "LLM: " + text[:200]

    print("verdict=" + ("REJECT" if verdict == "FAIL" else "PASS"))
    print("reason=" + reason.replace("\n", " ")[:400])
    return 0


if __name__ == "__main__":
    sys.exit(main())
