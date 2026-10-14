---
title: アリュージョニスト Wiki Lab
description: コメント・reject・ユーザー編集の受け口を実験する場（本番 Wiki には影響しません）
date: 2026-10-14
---

# アリュージョニスト Wiki Lab（実験場）

本番の [アリュージョニスト Wiki 2](https://allusionistwiki.github.io/AllusionistWiki2/) に適用する前に、**ユーザーコメント（Cusdis）・reject/編集要求（フォーム）の受け口**を検証するための実験サイトです。

## 実験ページ

- [サンプルクレームページ](claims/sample-claim.md) — ページ下部の Cusdis コメント欄（匿名コメント可否・モデ削除手順の確認）
- [reject / 編集要求フォーム（導線）](rejects.md) — Tally フォーム設置ガイドと受け口設計
- [Markdown / GFM 記法 表示テスト](format-test.md) — 表・callout・数式・コード・脚注等のレンダリング確認

## 現在の実験構成

| 受け口 | 手段 | 状態 |
|---|---|---|
| コメント | Cusdis（無料ホスティング・匿名可） | 埋め込み済み（app_id 登録待ち） |
| reject・編集要求 | Tally フォーム（予定） | ガイド設置済み |
| 収集→LLM トリアージ→run 化 | cron（Phase 2） | 未実装 |

- 本家 Wiki: https://allusionistwiki.github.io/AllusionistWiki2/
- repo: https://github.com/allusionistwiki/AllusionistWikiLab
