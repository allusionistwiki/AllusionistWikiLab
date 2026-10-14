# AllusionistWikiLab

アリュージョニスト Wiki 2 の**受け口実験場**（コメント・reject・ユーザー編集）。本番 Wiki には影響しない。

- サイト: https://allusionistwiki.github.io/AllusionistWikiLab/
- 実験構成: Cusdis（匿名コメント・OSS）＋ Tally フォーム（reject/編集要求）→ LLM トリアージ → run 化（Phase 2）

## 構成

- Quartz 骨格は AllusionistWiki2 と同一（`quartz/`、`quartz.config.ts`、`quartz.layout.ts`）
- `quartz/components/Cusdis.tsx` ＋ `scripts/cusdis.inline.ts` — 自作埋め込みコンポーネント（app_id 未設定時は読み込みスキップ）
- `content/` — 実験ページ 4 本（トップ / サンプルクレーム / reject 導線 / Cusdis 設定手順）
- デプロイ: GitHub Pages（push で自動ビルド）

## 使い方

1. cusdis.com でサイト登録 → app_id 取得
2. `quartz.layout.ts` の `Component.Cusdis({ appId })` に設定 → push
3. 各ページ下部で匿名コメント投稿 → ダッシュボードでモデ削除を検証

## 本番適用の判断基準（Lab での観測項目）

- 匿名コメントの流入品質・スパム量（1週間）
- モデ即削除の実用性
- コメントエクスポート → LLM トリアージ入力としての成形性
