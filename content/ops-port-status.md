AllusionistWiki 移植 — 作業状態スナップショット (2026-10-19, Strata 停止前の退避)

# 目的
Lab の自動パイプライン(報告→トリアージ→llm-task→gate→自動マージ→LLM監査→revert→deploy)を
Wiki1(本番 AllusionistWiki)へ移植中。Wiki2 は対象外(完成度低)。

# 完了済み
## 移植ファイル (コミット済み)
- Wiki1 repo (allusionistwiki/AllusionistWiki): コミット aeaa538 push 済み
  - .github/workflows/{issue-triage, llm-task, pr-gate, merge-audit, tests}.yml (Lab 版コピー)
  - scripts/{pr_gate_checks.py, audit_pr.py, tests/test_pr_gate_checks.py}
    - pr_gate_checks: llm-task の本番 content/ 編集を FAIL 化済み → 22:0x に warning 化へ修正コミット済み (全ページ自動許容の方針反映)
  - .github/ISSUE_TEMPLATE/reject.yml
  - quartz/components/GitHubLinks.tsx + quartz.layout.ts 接続 (右カラム、TOC の下)
  - content/reports/index.md
- vault repo (allusionistwiki/AllusionistWiki_obsidian): 未コミット (working tree)
  - .github/workflows/llm-task.yml (vault 適応版: wiki/ 限定・main 直 push・PR job 除去・
    bash -n / heredoc python compile / yaml.safe_load 検証済み)
  - .github/workflows/merge-audit.yml (Lab 版コピー)
  - scripts/{audit_pr.py, pr_gate_checks.py, tests/test_pr_gate_checks.py}
  - .gitignore (__pycache__/, *.pyc)

## ランナー側 (完了・稼働実証済み)
- runner = C:\ci\actions-runner-lab (用户名なしパス)、id 32 online、サービス RUNNING、
  LogOn .\awiki-runner 復帰済み (1069 原因=SeServiceLogonRight 喪失、C:\ci-rights2.inf で復元)
- 並発 2 (.env RUN_SERVICE_CONCURRENT_REQUESTS_LIMIT=2)、llm-task timeout 180 分
- E2E 完走済み: Issue #75 → run #81 → PR #76 merged → gate PASS → audit PASS → deploy → Issue closed
  (https://allusionistwiki.github.io/AllusionistWikiLab/entities/cinnamon-riakira 公開確認)

# 未着手 (次ターン以降)
1. vault repo の git commit + push (上記ファイル) → vault 側の Wiki1 再デプロイ連鎖を確認
2. GitHub 側 secrets/ラベル設定 (ユーザー UI 依頼):
   - Wiki1 repo secrets: PAT_TOKEN, HOST_HERMES_HOME, HOST_HERMES_BIN, HOST_CODE_ROOT
   - vault repo secrets: 同上 4 種
   - environment 'strata-audit' の secrets (STRATA_API_URL / STRATA_API_KEY / STRATA_MODEL) を
     Wiki1・vault 両 repo に追加 (Lab と同じ値)
   - PAT (awikicollector) の対象 repo 追加 (全 wiki 系統が対象か確認; 画像では
     AllusionistWiki_obsidian/AllusionistLLMWiki2_Obsidian/YuragiWiki/AllusionistWikiLab の 4 =
     **AllusionistWiki 本体が無い → 追加必要**)
   - ラベル作成: Wiki1・vault に triage / llm-task
   - Wiki1 repo の Actions general visibility: Visible (self-hosted ジョブ実行用)
3. E2E 検証:
   - Wiki1: Issue 作成(triage ラベル) → llm-task → PR → gate → merge → audit → deploy 確認
   - vault: Issue → llm-task main push → merge-audit 発火 → audit-log / revert 挙動確認
   - llm-task の Strata 参照 (wiki-runner プロファイルの Strata 設定) 確認
4. design-ops 更新: Wiki1 側パイプライン運用ページ (content/reports/design-ops.md 案) + Lab design-ops の移植反映
5. Tally 本番フォーム (API 401 で作成不可 → 当面は Lab フォーム EqzzbX 共用、GitHubLinks は共用 URL)

# 注意 (Strata 停止に関する効き方)
- llm-task の Hermes (wiki-runner) と merge-audit の LLM 監査 (STRATA_* env) は Strata サーバ前提。
  Strata 停止中:
  - merge-audit は Strata 呼び出し失敗時 NEEDS_HUMAN=PASS 側の設計 (自動 revert は SPAM 確定時のみ) なので
    監査 job が落ちない限りチェーンは進む (API 失敗の扱いを次ターンで確認)。
  - llm-task はモデル応答が無いと run 失敗/タイムアウト。
- 移植チェーンの GitHub 側 (triage/gate/merge/deploy) は Strata 非依存。
