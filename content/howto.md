---
title: Cusdis 設定手順
date: 2026-10-14
comments: false
---

# Cusdis 設定手順（app_id 登録）

1. https://cusdis.com にアクセス →「Get Started」で無料登録（メールで可）
2. ダッシュボードで **Add Site** → Site URL に `https://allusionistwiki.github.io/AllusionistWikiLab/` を登録
3. 発行される **app_id** をコピー
4. この repo の `quartz.layout.ts` を編集:
   ```ts
   afterBody: [
     Component.Cusdis({ appId: "<app_id>" }),
   ],
   ```
5. push → 自動デプロイ → 各ページ下部にコメント欄が表示される

## 確認項目

- [ ] 匿名コメント（名前のみ・メール空欄）が投稿できる
- [ ] 1ページ 1スレッド（thread-id = ページ slug）で分離されている
- [ ] 管理ダッシュボードからコメントを即削除できる（スパム即戻し）
- [ ] スパムコメントが実際にどの程度流入するか（1週間観測）
- [ ] コメントのエクスポート（JSON）が取得できる → Phase 2 の LLM トリアージ入力に使用

## 載せ替え先（将来）

Cusdis は OSS なので、自前サーバー運用（Strata 機＋Cloudflare Tunnel）へ同じソフトで移行可能。本番 Wiki への適用判断はこの Lab での観測後に行う。
