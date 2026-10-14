---
title: "表示テスト: Markdown / GFM 記法"
date: 2026-10-14
description: 本番 Wiki への適用前に、Quartz（GFM+OFM）でのレンダリングを確認するテストページ
comments: false
---

# 表示テスト: Markdown / GFM 記法

[GitHub 基本記法ドキュメント](https://docs.github.com/ja/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) を網羅した表示確認ページです。

## 1. 見出し

### 三段見出し
#### 四段見出し

## 2. 強調

**太字**、*斜体*、***太字＋斜体***、~~取り消し線~~、`インラインコード`、==ハイライト==

日本語混在: **アキラの左腕**は*無彩色*である。

## 3. リスト

- 順不同リスト A
- 順不同リスト B
  - ネスト項目
  - 2. 番号付きネスト
1. 番号付き 1
2. 番号付き 2

### タスクリスト

- [x] 完了タスク
- [ ] 未完了タスク
- [ ] Cusdis app_id 登録

## 4. 引用・アラート（callout）

> 引用文 — 引用内は **強調** が効く

> [!NOTE]
> Quartz callout: 情報（本番 Wiki の層説明で多用）

> [!TIP]
> 実用メモ（Strata 直列運用等）

> [!WARNING]
> 警告（spoiler 注意・来歴チェーン切断警告）

> [!IMPORTANT]
> 重要（原文至上原則）

> [!CAUTION]
> 危険操作（旧 run 書き換え禁止）

## 5. コード

```python
def triage(comment: str) -> dict:
    # LLM トリアージ擬似
    return {"kind": "reject", "confidence": 0.82, "run": "20261014T1200_ab12"}
```

```json
{ "contributed_by": "discord:user1", "derived_from": "20261012T0000_baseline" }
```

```text
インデントコードブロック（verbatim）
    4スペースインデント
```

## 6. 表

| 層 | 内容 | 公開 |
|---|---|---|
| L1 | 機械抽出 | ✓ |
| L7 | 人間訂正済み表示層 | ✓ |
| L0 | raw 原文 | **非公開** |

右寄せ:

| 項目 | 件数 |
|---|---:|
| claims | 1,234 |
| mysteries | 567 |

## 7. リンク・参照

- 相対リンク: [サンプルクレーム](claims/sample-claim.md)
- 外部リンク: [DESIGN_NOTES](https://github.com/allusionistwiki/AllusionistWiki_obsidian/blob/main/DESIGN_NOTES.md)
- wikilink: [[claims/sample-claim|サンプルクレーム（wikilink 経由）]]
- 相対パス相対: [reject 導線](rejects.md)
- 自動リンク: https://allusionistwiki.github.io/AllusionistWiki2/
- @メンション風: @allusionistwiki（Wiki 上ではただのテキスト）

## 8. 数式（KaTeX）

インライン数式 $E = mc^2$ とブロック数式:

$$
\text{確度} = \frac{\text{典拠数}}{\text{典拠数} + \text{反証数}}
$$

## 9. 改行・区切り

行末2スペース改行→
効くべき（linebreaks プラグインで有効）

---

上線区切りは上の行とこの行の間。

## 10. 折りたたみ

<details>
<summary>ネタバレ: 第12章の考察（折りたたみ）</summary>

details 内の **Markdown** もレンダリングされる。

</details>

## 11. 脚注

脚注付きの文[^1] と二つ目の脚注[^2]。

[^1]: 脚注1の内容 — 典拠「第3章 p.112」
[^2]: 脚注2の内容 — 複数行はインデントで

## 12. 絵文字・特殊文字

:warning: 絵文字ショートコード、Unicode 直接 ➡️ ➊ ① → 矢印、全角記法「」『』・―

## 13. 画像（プレースホルダ）

![代替テキスト](https://github.githubassets.com/images/icons/emoji/unicode/1f4da.png)

## 14. 検証チェックリスト

- [ ] 表の右寄せが効いている
- [ ] callout 5 種が装飾表示される
- [ ] Python/JSON のシンタックスハイライト（明暗テーマ対応）
- [ ] 数式が KaTeX で描画される
- [ ] wikilink が解決される（404 にならない）
- [ ] details が展開できる
- [ ] 脚注が末尾に生成される
- [ ] ==ハイライト== が表示される（未対応なら素の `==` が見える＝要プラグイン）
