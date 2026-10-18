---
title: "Playground（遊び場）: 仮説自由記述層"
date: 2026-10-16
description: スキーマ検証を受けない自由記述の場。マクロな考察・仮説・LLM との対話ログを「思考の痕跡」として置き、Core 層への昇格候補を育てる（Issue #19 起案）
review_status: llm_verified
---

# Playground（遊び場）: 仮説自由記述層

> [!NOTE]
> この節は [WikiLab](../index.md) 内の**遊び場（Playground）**です。ここに書かれた記述はすべて**仮説（Hypothesis）または思考の痕跡**であり、確定した事実ではありません。事実として引用しないでください。

本番 Wiki の正規層（Core）が「検証済みで信頼できる知識」を置く場なのに対し、Playground は **スキーマ検証（Lint）を受けない自由な Markdown** で、マクロな考察・仮説のブレインストーミング・LLM との対話ログを置く場です。「作品全体の神話的構造」のような超近視眼的な問いを、型にはまらずに書き始める場所として使います。

## ルール

| 項目 | Core 層（正規層） | Playground（本節） |
|---|---|---|
| 記述形式 | 厳密なスキーマ準拠（ID 体系 `E_` / `A_` / `MY_`、Lint 必須） | 自由な Markdown（Lint 対象外） |
| 記述の地位 | 検証済みの知識 | 仮説・思考の痕跡（未確定） |
| 目的 | 信頼できる知識の保存・公開・GraphRAG ソース | 探索（Exploration）と創発 |
| 引用 | 事実として引用可 | 出典として引用不可（昇格後にのみ可） |

Playground 内のページは自由に作成・改変して構いません。代わりに、**冒頭に状態ラベル**を付けて「これは事実ではない」ことが視認できるようにします。

## 状態ラベル（語彙）

| 状態 | 意味 |
|---|---|
| `draft` | 書きかけのメモ |
| `exploring` | 検討中（LLM 対話ログを含む） |
| `promotion-candidate` | 昇格候補 — Core 層の主張（`A_`）に翻訳する価値があると判断した仮説 |
| `promoted` | 昇格済み — Core 層に正式な主張として反映された（反映先の ID を記載） |
| `discarded` | 破棄 — 検証に耐えなかった記録（来歴として残す） |

## 使い方

1. 新しい仮説を書く: [[hypothesis-template]] をコピーして `content/playground/` 直下にページを作成
2. LLM との対話ログを貼り付けて検討してよい（対話の要点を「材料」節に整理する）
3. 考察の材料には Core 層の確定済み事実（エンティティ `E_`・主張 `A_`・伏線 `MY_`）を使ってよい。**事実を無視した飛躍には「根拠なし」と注記**する
4. 「本物の洞察だ」と思えたら状態を `promotion-candidate` にし、[[promotion]] の手順で Core 層への昇格ドラフトを起こす

## Playground の一覧

- [[promotion]] — Playground と Core をつなぐ「昇格」プロトコルの設計図（たたき台）
- [[hypothesis-template]] — 仮説メモの書式テンプレート
- [[kouzetsu]] — 【口舌】の正体（原文 ¶ 照合で確定化した事実＋未検証の推察を併記・`promotion-candidate`）
- [[rakulraal-seat]] — 第一位のラクルラールの座は誰が勝ち取ったのか（4 章ラスト・イツノとマラコーダの会話／原文 ¶ 照合・`promotion-candidate`）
- [[relations-six]] — 六人の関係性マップ（ベアトリーチェの融合先と、アズーリア・レオ・青嶺瑠璃の繋がり／原文 ¶ 照合・`promotion-candidate`・Issue #31）
- [[gogmagog]] — 5-15 の「ゴグマゴグ」（イギリス伝承の巨人 Gogmagog と聖書のゴグとマゴグの照合／原文未照合・`exploring`・Issue #63）

## 来歴（provenance）

| 項目 | 値 |
|---|---|
| 起案 | Issue #19（Tally 編集提案フォーム経由・依頼者 allusionistwiki） |
| 実装 | llm-task（LLM 編集依頼）による作成 |
| 審査 | `review_status: llm_verified`（LLM 自己審査による暫定承認・人間レビュー未実施） |

> [!CAUTION]
> Playground の記述を Core 層のページから wikilink で参照してはいけません（未検証の仮説が正規層の文脈に混入するため）。参照方向は常に **Playground → Core**（材料として読む方向）に限定します。
