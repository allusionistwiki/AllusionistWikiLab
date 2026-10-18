---
title: llm-task-e2e
date: 2026-10-18
review_status: llm_verified
comments: false
---

# llm-task 端到端検証

> [!NOTE]
> このページは llm-task（LLM 編集依頼）パイプラインの端到端（e2e）検証用に作成された**試験ページ**です。本番データ・作中事実は含みません。

llm-task 端到端検証 成功 2026-10-17

## 目的

Issue 起票 → `llm-task` ラベル → LLM 実装 → PR → 機械ゲート → 自動マージ → LLM 監査 → デプロイ、という公開経路（[[system]] 参照）が通ることを確認する。パイプライン案内にある「端到端検証」の PR 版（[[pr-test]]）に対応する **Issue 起点（編集依頼）** 版の検証である。

## 検証項目

- [x] Issue 起点（`llm-task` ラベル）で新規ページが作成された
- [x] frontmatter が既存ページの様式（`title` / `date` / `review_status`）に準拠している
- [x] 書き込みが `content/` 配下に限定されている
- [ ] 機械ゲート PASS（守備ファイル非変更・content/ 外書き込みなし・ビルド成功）
- [ ] LLM 監査の判定と `audit/audit-log.jsonl` への来歴記録

典拠はテスト対象のため付さない（依頼本文の指示どおり）。原文（`AllusionistWiki_raw`）の照合も行う必要がない。

## 来歴（provenance）

| 項目 | 値 |
|---|---|
| Requested-by | Issue #41（種別「編集提案」→ `llm-task` 自動付与） |
| 依頼者 | allusionistwiki |
| 対象 | `content/llm-task-e2e.md`（新規作成） |
| 実装 | llm-task パイプライン（Hermes 実装 → 機械ゲート → LLM 監査） |
| 典拠 | テストのため典拠不要（依頼本文に明記） |
| 審査 | `review_status: llm_verified`（LLM 自己審査による暫定承認・人間レビュー未実施） |

## 関連

- [[system]] — 受け口と自動パイプライン（llm-task の運用手順）
- [[pr-test]] — PR 起点の端到端検証ページ
- [[foreshadow-test]] — llm-task で作成された試験ページ（伏線台帳）
- [[index]] — Lab 全体案内
