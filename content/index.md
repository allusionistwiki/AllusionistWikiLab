---
title: アリュージョニスト Wiki Lab
description: コメント・reject・ユーザー編集の受け口を実験する場（本番 Wiki には影響しません）
date: 2026-10-14
---

# アリュージョニスト Wiki Lab（実験場）

本番の [アリュージョニスト Wiki 2](https://allusionistwiki.github.io/AllusionistWiki2/) に適用する前に、**受け口（コメント・報告・依頼・編集）と自動パイプライン（機械ゲート + LLM 監査 + LLM 実装）** を検証するための実験サイトです。

## 案内

- **[システム概要: 受け口と自動パイプライン](system.md)** — Issue/PR の作り方、LLM 監査、LLM 編集依頼（llm-task）のシステム説明
- [サンプルクレームページ](claims/sample-claim.md) — ページ下部のコメント欄（giscus 実名 + EchoThread 匿名）
- [reject / 編集要求フォーム（導線）](rejects.md) — Tally フォーム（匿名可）と受け口設計
- [Markdown / GFM 記法 表示テスト](format-test.md) — 表・callout・数式・コード・脚注等のレンダリング確認
- [伏線台帳（試験用）](foreshadow-test.md) — llm-task（LLM 編集依頼）で作成された試験ページ
- [シナモリアキラ（異名表記まとめ）](entities/cinnamon-riakira.md) — llm-task（Issue #20）で作成された異名・筆名のまとめページ

## 現在の構成

| 受け口 | 手段 | 状態 |
|---|---|---|
| コメント（実名） | giscus（GitHub Discussions） | 稼働 |
| コメント（匿名） | EchoThread（ゲスト投稿・日本語化） | 稼働 |
| 誤り・reject 報告 | Issue テンプレート / Tally フォーム（匿名可） | 稼働 |
| 編集依頼（LLM 実装） | Issue + `llm-task` ラベル → Hermes 実装 → PR 化 | 稼働 |
| 直接編集 | PR → 機械ゲート → 自動マージ | 稼働 |
| LLM 監査 | マージ後 Strata（ローカル LLM）判定 → 第三者 REJECT は自動 revert | 稼働 |

- 本家 Wiki: https://allusionistwiki.github.io/AllusionistWiki2/
- repo: https://github.com/allusionistwiki/AllusionistWikiLab
