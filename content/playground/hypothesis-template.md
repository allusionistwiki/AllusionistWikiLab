---
title: "仮説メモ テンプレート（Playground 用）"
date: 2026-10-16
description: content/playground/ に新しい仮説ページを作る際にコピーするテンプレート。自由記述・Lint 対象外
review_status: llm_verified
comments: false
---

# 仮説メモ テンプレート（Playground 用）

> [!NOTE]
> このページをコピーして `content/playground/<任意のページ名>.md` に保存し、角括弧のプレースホルダを埋めて使ってください。frontmatter の `status` は [[playground/index|状態ラベル]] の語彙（`draft` / `exploring` / `promotion-candidate` / `promoted` / `discarded`）から選びます。

## 書式（コピー用）

```markdown
---
title: "[仮説の一行要約]"
date: [YYYY-MM-DD]
status: draft
related: []      # 関連する Core 層 ID（E_ / A_ / MY_）を列挙（任意）
review_status: llm_verified
comments: false
---

# [仮説の一行要約]

## 仮説

[こうなっているのではないか、という自由な推測をそのまま書く。文体・構成は自由]

## 材料（Core 層の事実）

- [参照した確定済み事実: ID と一言。原文引用は出典確認用の最小限の抜粋に留める]

## 飛躍・根拠なし注記

- [材料にない飛躍があれば明示する（ハルシネーション線引き用）]

## 対話ログ（任意）

[LLM との対話の要点。全文を貼ってもよい]

## 昇格ドラフト（promotion-candidate になった時だけ）

- 主張文（subject / predicate / object 形式への翻訳案）:
- 想定典拠（章・話 / ¶ / p）:
```

## 使用上の注意

- 本文は自由記述です。Lint・スキーマ検証の対象外（[[playground/index|Playground 運用則]]）
- 状態が上がったら（`promotion-candidate` 以上）[[promotion]] の手順に従う
- 原文（小説本文）の長文引用はしない（引用は本番運用と同じく最小限の抜粋のみ）
