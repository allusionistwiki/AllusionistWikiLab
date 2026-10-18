---
title: Lab パイプライン設計・設定場所（移行用）
description: 全自動レビューパイプラインの構成、設定の置き場所、移行手順。障害対応で得た落とし穴も記録。
date: 2026-10-18
---

# Lab パイプライン設計・設定場所（移行用）

AllusionistWikiLab（リポジトリ `allusionistwiki/AllusionistWikiLab`、GitHub Pages: `allusionistwiki.github.io/AllusionistWikiLab`）の全自動運用の設計書。**秘密値は本ページに書かない**（名前と場所のみ記載）。

## 1. 全自動チェーン

```
Issue (report forms: GitHub Issue / Tally 匿名フォーム → collect_reports.py が Issue 化)
  → issue-triage.yml   … 自動ラベル (triage / llm-task 判定)
  → llm-task.yml       … wiki-runner エージェントが実装 (PR 作成 / Issue flow は llm-issue-N ブランチへ push → PR 自動作成)
  → pr-gate.yml        … gate job (ubuntu: 機械チェック + Quartz build) → merge job (自己ホスト: 自動マージ / request_changes)
  → merge-audit.yml    … マージ後監査 (機械ヒューリスティクス + Strata LLM)。REJECT 時 revert (作成者除外) + PR コメント + audit-log 追記
  → deploy.yml         … Quartz build → GitHub Pages
  → Issue close
```

- 発火トリガは **label トリガと PR/Issue イベントのみ**（PAT に Actions 書込みスコープは意図的に無し → `workflow_dispatch` API は 403。外部からの直接発火が必要になった時のみスコープ追加）。
- ゲート再発火のゼロコミット経路 = **PR の close→reopen**（API。`reopened` トリガ）。空コミット連鎖・update-branch は使わない。
- マージは **squash + head SHA pinning**（gate 検査後の force-push は 409 で弾かれ再ゲート）。監査・デプロイは「owner による push」として発火するため、マージは PAT（owner 名義）で実行する（GITHUB_TOKEN マージは下流ワークフローを発火させない）。

## 2. ワークフロー（`.github/workflows/`）

| ファイル | 役割 | キモ |
|---|---|---|
| `issue-triage.yml` | Issue 自動トリアージ | PAT でラベル付与。llm-task は人間の後付け必須（匿名入力のインジェクション防止） |
| `llm-task.yml` | 実装エージェント | `HERMES_BIN chat -q`（wiki-runner プロファイル）。タイムアウト 90 分。プロンプトは `content/` 限定書き込み + 一族 repo RX 参照。`secrets.HOST_*` 未設定時はステップ冒頭ガードで即停止。issue flow は `llm-issue-N` ブランチ固定（main 直書き不能）+ `content/` 限定 add ガード |
| `pr-gate.yml` | 機械ゲート＋自動マージ | 検査は ubuntu、マージは自己ホスト（owner push）。payload は python 生成 JSON ファイル（`--data @file`）。**gh CLI 不可（後述 §5）** |
| `merge-audit.yml` | マージ後 LLM 監査 | revert は親数分岐（squash=1 親→通常 revert）。audit log は `if: always()`（revert 失敗でも dedup ログは残る＝再監査ループ防止）。paths-ignore により meta push では発火しない |
| `deploy.yml` | Pages デプロイ | paths-ignore（audit-log/ワークフロー変更で再ビルドしない） |
| `tests.yml` | ゲート回帰テスト CI | `scripts/**` 変更時に pytest（7 テスト）。壁の破壊をマージ前に検出 |

## 3. スクリプト（`scripts/`）

- `pr_gate_checks.py` — 機械ゲート本体。**git は list 引数のみ**（shell=True 禁止＝ファイル名経由インジェクション防止）、`--no-renames -z`（rename による保護パス回避防止）、git 失敗は raise（沈黙 PASS 禁止）。検査: 保護パス / `content/` 限定 / 削除率(ベース 500 行以上でのみ 30%) / 追加行の外部ホスト(>5、playground 免除) / 追加行の XSS パターン（script・on=・javascript:・vbscript:・data:text/html）
- `audit_pr.py` — 監査本体。**判定は出力先頭行アンカー**（^PASS/SPAM/NEEDS_HUMAN、曖昧は NEEDS_HUMAN＝自動 revert しない安全側）。diff 2 万文字超は人間回し
- `collect_reports.py` — Tally+EchoThread 報告 → Issue 化。secrets ディレクトリは `AWIKI_SECRETS` 環境変数（既定 `%LOCALAPPDATA%\hermes\profiles\awiki2\secrets`）
- `tests/test_pr_gate_checks.py` — 回帰テスト（rename/インジェクション/削除率/誤検出防止/XSS/playground 免除）

## 4. GitHub 側の設定

- **Environments**: `strata-audit`（監査ジョブの環境承認＝人間ゲート）
- **Repository secrets（名前のみ）**: `PAT_TOKEN`（owner 名義 PAT: Contents R/W + Administration。Actions・Admin:secrets スコープ意図的になし）、`STRATA_API_URL` / `STRATA_API_KEY` / `STRATA_MODEL`（Strata OpenAI 互換エンドポイント）、`HOST_HERMES_HOME` / `HOST_HERMES_BIN` / `HOST_CODE_ROOT`（自己ホストのパス。公開ファイルにパスを書かないためのもの）
- **PR テンプレート**: `.github/ISSUE_TEMPLATE/reject.yml`（4 種別: 誤り / reject / 編集依頼 / 情報提供。サイト側リンクから URL 自動入力）
- **ラベル体系**: `triage`（トリアージ済み）, `llm-task`（実装委任）, `needs-human-review`
- **audit/**: `audit-log.jsonl`（sha 単位 dedup + 来歴。`audit:` / `Revert*` コミットは監査対象外＝ループ防止）

## 5. 自己ホスト runner（Windows）

- 場所: `%USERPROFILE%\Downloads\Code\actions-runner-lab`（リポジトリ作業ツリーは `_work\awiki-runner\AllusionistWikiLab\AllusionistWikiLab`）
- サービス名: `actions.runner.allusionistwiki-AllusionistWikiLab.MAIN-DESK`（`--runasservice`、ラベル `self-hosted,Windows,X64`）
- 並発: ルート `.env` の `RUN_SERVICE_CONCURRENT_REQUESTS_LIMIT=2`（LLM タスク中に監査が待たされないため）。**反映にはサービス再起動**（管理者で `net stop/start`）
- **サービス runner の PATH はレジストリ** `HKLM\SYSTEM\CurrentControlSet\Services\<サービス名>\Environment`（REG_MULTI_SZ、Git/Python/Node/hermes のみを列挙）。**gh CLI は無い** — ワークフローは curl 専用。`|| true` 付きの gh 呼び出しは沈黙失敗になるので禁止
- 実行ユーザー `awiki-runner` の ACL（ホワイトリスト方式・kernel 強制）: 一族 repo 10 件 RX、wiki-runner プロファイル F、hermes ランタイム RX/M（`.hermes\bin` に M 必須＝無いと mint_launcher が無音リトライループで全コア消費）。**secrets・Strata 設定への付与なし**（PAT はジョブ環境変数でのみ届く）
- wiki-runner 実行の追跡: `hermes -r <session-id> -p wiki-runner`（llm-task の live ログは Actions ログに tee 済み、`PYTHONUNBUFFERED=1`）

## 6. ローカル（このマシン）の設定場所

| もの | 場所（%USERPROFILE% / %LOCALAPPDATA% 表記） |
|---|---|
| Lab 作業ツリー | `%USERPROFILE%\Downloads\Code\AllusionistWikiLab` |
| 一族リポジトリ (raw/vault/work/wiki/portal) | `%USERPROFILE%\Downloads\Code\` 直下 |
| ローカル secrets（PAT・Tally 等ファイル） | `%LOCALAPPDATA%\hermes\profiles\awiki2\secrets` |
| llm-task 実行プロファイル | `%LOCALAPPDATA%\hermes\profiles\wiki-runner` |
| Strata サーバー (RTX 3090 Ti 1 枚・batch 8) | `%USERPROFILE%\Downloads\Code\Strata-main\`（設定 JSON・OpenAI 互換 /chat/completions） |

## 7. 移行手順（新マシン）

1.一族リポジトリ + Lab を `%USERPROFILE%\Downloads\Code` に clone（raw は private）
2.PAT 準備（スコープ: Contents R/W + Administration のみ）→ repo secrets `PAT_TOKEN` 設定
3.Strata サーバー構築 → `STRATA_API_URL/KEY/MODEL` 設定（batch・GPU 権の共有でバースト停滞あり。llm-task タイムアウト 90 分はこれに由来）
4.wiki-runner プロファイル作成 + hermes 導入 → `HOST_HERMES_HOME/BIN`、`HOST_CODE_ROOT` 設定
5.runner インストール: `config.cmd --url <Lab repo> --name <name> --runasservice` → サービスのレジストリ Environment に PATH 設定（Git/Python/Node/hermes）→ `.env` に並発 2 → サービス起動。**サービス runner には gh を入れない**（curl 前提のワークフロー）
6.ACL 設定（§5 の付与範囲をホワイトリストで）→ llm-task の小さな Issue で E2E 確認 → 監査承認（environment `strata-audit` の承認者設定）

## 8. 運用則・落とし穴（実測由来）

- ワークフローのシークレット参照は bash 変数経由のみ（`Bearer $PAT`）。**ツール表示のマスク `Bearer ***` をそのまま書くと 401**（マスク往復トラップ）。検証は print ではなく count で
- API JSON はファイルへ受けて python へ渡す（curl パイプは 5KB 超で切り詰められ JSONDecodeError）。パスを python 文字列リテラルに埋めると `\U` エスケープで壊れる → argv 経由
- Windows Runner の print は cp932 → `PYTHONIOENCODING=utf-8`。YAML に python heredoc を挿入したら `yaml.safe_load` を main/head 両方で通す
- ゲート修正は head ブランチへ届ける（ゲートが使うワークフローは PR head 版）
- 匿名入力の自動実装禁止（llm-task ラベルは人間後付け）。マージ後の最終安全網は revert（owner 編集は advisory のみ）
- 変更は 1 束ね 1 コミット（meta push は audit/deploy どちらも paths-ignore で発火ゼロ）

関連: [[playground/index|Playground（報告導線）]] ・ [[system|Lab システム解説]]
