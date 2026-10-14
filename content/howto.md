---
title: EchoThread 設定手順
date: 2026-10-14
comments: false
---

# EchoThread 設定手順（API key 登録）

> **Cusdis は 2026-07 に公式廃止**（リポジトリ archive・ホスティングサービス終了）ため、
> 後継として **EchoThread**（ホスティング型・無料 Hobby 枠・ゲスト=無アカウント投稿対応）に載せ替えました。

1. https://echothread.io/signup で無料登録（クレジットカード不要・Hobby 枠は永久無料: 1サイト / 月10,000 PV / 月1,000コメント）
2. ダッシュボードで **Add site** → ドメイン `allusionistwiki.github.io` を登録
3. 発行される **API key** をコピー
4. この repo の `quartz.layout.ts` を編集:
   ```ts
   afterBody: [
     Component.EchoThread({ apiKey: "<API_KEY>" }),
   ],
   ```
5. push → 自動デプロイ → 各ページ下部にコメント欄が表示される

## 確認項目

- [ ] ゲスト（無アカウント）でコメントが投稿できる
- [ ] 1ページ 1スレッド（ページ URL / title 基準）で分離されている
- [ ] ML スパムフィルタが効く（スパムが自動スコアリングされる）
- [ ] 管理ダッシュボードから承認/却下/削除できる（スパム即戻し）
- [ ] コメントのエクスポート（JSON / CSV）が取得できる → Phase 2 の LLM トリアージ入力に使用

## 設計上の位置づけ

- **EchoThread** = 匿名コメントトラック（本ページの実験対象）
- **giscus** = GitHub 実名トラック（Discussions に公開蓄積）
- どちらも**ビルド成果物に書き込まれない**（スパムが L7 を汚染しない）
- 構造化 reject/編集要求は Tally フォーム / Discord へ（→ LLM トリアージ → run 化）

## 載せ替え先（将来）

EchoThread が合わなければ、同じ枠（ホスティング・匿名対応）で Hyvor Talk / GraphComment 等を比較。
セルフホスト系（Isso / Remark42 / Comentario）は現運用方針（サーバー追加なし）では対象外。
