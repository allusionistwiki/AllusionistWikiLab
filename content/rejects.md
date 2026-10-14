---
title: reject / 編集要求フォーム（導線）
date: 2026-10-14
comments: false
---

# reject / 編集要求フォーム

Wiki の記述に対する reject・事実誤り・編集提案・情報提供を受け付けるフォームです。匿名で投稿できます（名前・メールは任意）。

<iframe src="https://tally.so/embed/EqzzbX?alignLeft=1&hideTitle=1&openAsPopup=0" width="100%" height="640" frameborder="0" marginheight="0" marginwidth="0" title="Wiki 指摘・編集フォーム"></iframe>

フォームが表示されない場合は → [直接開く](https://tally.so/r/EqzzbX)

## 処理パイプライン（Phase 2）

```
フォーム回答 → cron 収集（Tally API / CSV export）
  → LLM トリアージ（妥当性判定・スパム分類・対象 run の特定）
  → 新 run 生成（run.json に contributed_by・source_form を記録）
  → 人間は承認 / reject のみ
```

## 設計原則

- ユーザー入力は**パイプライン経由のみ**で内容を反映する（ページ直接編集は不可）
- reject は「LLM 再審査トリガー」であり、来歴チェーン（L7→L3→L2→L1→L0）は切らない
