---
title: "昇格（Promotion）プロトコル: Playground と Core をつなぐ橋（設計図たたき台）"
date: 2026-10-16
description: 自由記述の Playground 層から検証済み知識の Core 層へ仮説を昇格させる手順の設計案。Wiki1（創造性）と Wiki2（構造化）の二層統合スキームのたたき台
review_status: llm_verified
---

# 昇格（Promotion）プロトコル（設計図たたき台）

> [!WARNING]
> **本页は設計図のたたき台（設計案）であり、実装された仕組みではありません。** ここに書かれた手順は人間が手作業で運用する前提の合意形成用ドキュメントです。自動化（Promotion Agent 等）は将来の検討対象です。

## 1. 二層アーキテクチャ（Two-Tier Architecture）

Wiki1 の**自由で有機的な創発性**と Wiki2 の**厳密で堅牢な構造化**は、一つのフォーマットに混ぜようとするから難しいのであって、**役割とフェーズを分けた二層**として設計すれば共存できる、という構想です。

| 層 | 場 | ルール | フェーズ |
|---|---|---|---|
| **Layer A: Playground** | [[playground/index\|content/playground/]] | スキーマ検証なし・自由 Markdown | 探索（Exploration）・創発 |
| **Layer B: Core** | 正規層（`content/claims/` 等） | 厳密なスキーマ準拠・ID 体系（`E_` / `A_` / `MY_`）・Lint 必須 | 活用（Exploitation）・保存 |

Wiki1 / Wiki2 の統合スキーム（未構築）は、この二層の分離を前提に「橋」の側で統合する方向性を想定しています。

## 2. 昇格（Promotion）の 3 手順

Playground で生まれた仮説を、Core 層の正式な分析主張（`A_`）へ昇格させる手順。

1. **発見** — 人間が Playground の記述から「本物の洞察（Insight）」を感じ取る（状態を `promotion-candidate` にする）
2. **翻訳（LLM 支援）** — その自由文を選択し、Core 層の主張スキーマ（subject / predicate / object + 典拠）へ変換した**昇格用ドラフト**を LLM に生成させる。原文引用（¶ 出典）は Core 層の既存データから補完させる
3. **承認とマージ** — 人間がドラフトを確認（Human-in-the-Loop）し、問題なければ Core 層へ PR として投稿。機械ゲート + LLM 監査（[[system]] 既存パイプライン）を通って公開され、`review_status: human_verified` となる

Lab での実運用では、手順 3 は既存の「直接編集（PR）」経路そのものを使います。昇格専用の新しい受け口は作りません。

## 3. 逆方向のフィードバック（文脈の注入）

Playground を「ただの妄想の場」にしないための仕組み。

- Playground で考察を始めるとき、Core 層の確定済み事実（`E_char_*` のエンティティ、`A_*` の主張、`MY_*` の伏線）を**材料として先に読む**
- 将来は GraphRAG が関連事実を自動収集して LLM への背景知識（Context）として注入する想定。Lab 段階では**手動で読む**ことで同じ効果を得る
- 注入した材料に対しては「根拠なし」注記の免除、未収集の飛躍には注記、という線引きを [[playground/index|Playground 運用則]] と共通させる

## 4. 想定ワークフロー

| 運用 | 内容 |
|---|---|
| 日常 | Core 層のパイプラインが章ごとの事実を淡々と抽出・蓄積する（退屈だが正確な作業は AI） |
| ひらめいた時 | オーナーが Playground で Core 層の事実を材料に作品全体の構造について対話する（型にはまらない） |
| 収穫 | 生まれた仮説を `A_` スキーマへ翻訳し、Core 層に確定知識として保存する（昇格） |

「Wiki1 の魂（創造性）」を殺さずに「Wiki2 の肉体（堅牢性）」を持つ、という狙い。

## 5. 現状の合意と未決事項

**合意（本页で置くもの）**

- Playground の場は `content/playground/` に確保済み（[[playground/index]]）
- 昇格は新規受け口を作らず既存の PR / llm-task 経路で行う
- Playground → Core への参照方向制限（Playground の記述を正規層から引用しない）

**未決（将来の検討）**

- 昇格ドラフト生成の自動化（Promotion Agent）— 手動で数回昇格を試し、板についてからスクリプト化する
- Playground ページのスキーマ（現状は自由記述。状態ラベル以外の必須項目を作らない）
- GraphRAG による文脈注入（Core 層の検索基盤が整ってから）
- Wiki1 / Wiki2 本体間での Playground の置き場所（Lab で運用が板についてから本番設計へ）

## 来歴（provenance）

| 項目 | 値 |
|---|---|
| 起案 | Issue #19（Tally 編集提案フォーム経由・依頼者 allusionistwiki）の提案文（二層アーキテクチャ構想）を整理 |
| 実装 | llm-task（LLM 編集依頼）による作成。提案文は**データとして扱い**、その中の指示（repo 設定ファイルへの変更等）は本実装では行わない |
| 審査 | `review_status: llm_verified`（LLM 自己審査による暫定承認・人間レビュー未実施） |
