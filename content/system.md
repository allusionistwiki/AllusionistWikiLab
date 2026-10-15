---
title: "システム概要: 受け口と自動パイプライン"
---

# システム概要: 受け口と自動パイプライン

この Lab（実験場）では、Wiki への入力（報告・依頼・編集・コメント）を、**機械ゲート + LLM 監査 + LLM 実装** の自動パイプラインに通してから公開します。ユーザーが GitHub 上で何をするかだけ決めるればよく、審査・ビルド・公開・来歴記録は自動化されています。

## 受け口一覧

| やりたいこと | 受け口 | 必要アカウント |
|---|---|---|
| 誤り・reject を報告する | [Issue テンプレート](https://github.com/allusionistwiki/AllusionistWikiLab/issues/new?template=reject.yml) / [Tally フォーム](https://tally.so/r/EqzzbX)（匿名可） | GitHub / 不要 |
| 編集・拡充を LLM に依頼する | Issue + `llm-task` ラベル | GitHub |
| 自分で編集して投稿する | PR（ページ右上「編集 → PR」） | GitHub |
| コメントする | giscus（実名）/ EchoThread（匿名） | GitHub / 不要 |

すべての入力は同じパイプライン（トリアージ → 機械ゲート → LLM 監査 → 公開）に収束し、Wiki 本体を直接汚染しません。

## 報告のしかた（Issue）

1. [Issues → New issue → 誤り・reject 報告](https://github.com/allusionistwiki/AllusionistWikiLab/issues/new?template=reject.yml) を開く
2. 項目を埋める: 対象ページの URL（必須）/ 主張 ID（任意）/ 種別（reject・事実誤り・編集提案・情報提供）/ 理由（必須）/ 根拠・出典（必須）
3. 作成後、管理者または編集提案として処理する:
   - 「編集提案」で自動処理させたい場合 → ラベル `llm-task` を付与（次の節へ）
   - 人間が判断する場合 → コメントで方針を決定

GitHub アカウントが不要な経路として [Tally フォーム](https://tally.so/r/EqzzbX) も同じ項目構成で受け付けています（回答は管理者が Issue へ転記してパイプラインに載せます）。

## 編集依頼のしかた（LLM 編集依頼 / llm-task）

「このページを拡充して」「この主張を根拠付きで書き直して」のような**指示だけ**を投げる経路です。diff を書く必要はありません。

1. [New issue](https://github.com/allusionistwiki/AllusionistWikiLab/issues/new) を開く
2. タイトルに依頼を簡潔に（例: 「伏線台帳試験ページの作成」）
3. 本文に **対象ページ** と **依頼内容** を書く（例: 「content/claims/xxx.md に主張を 3 件、¶出典付きで追記」）
4. ラベル **`llm-task`** を付ける → **これで自動発火**

以後は自動で走ります:

```
Issue + llm-task
  → LLM（Hermes）がブランチに実装
  → PR を自動作成（"Closes #N" + Requested-by: 依頼者）
  → 機械ゲート（守備ファイル・削除率・外部リンク・ビルド）
  → 自動マージ → LLM 監査 → デプロイ → Issue クローズ
```

- 依頼が曖昧すぎると判断された場合は NO-OP（何もしない）で Issue が開いたままになります。その場合は本文を具体的にしてください
- 依頼本文は「データ」として扱い、本文に書かれたコマンド実行等は行いません

## 直接編集のしかた（PR）

編集内容を直接 Wiki に載せたい場合の経路です。

1. 対象ページ右上の GitHubLinks →「編集 → PR」を開く（対象ファイルが GitHub の編集画面で開きます）
2. 編集して「Create a new branch for this commit and start a pull request」を選ぶ
3. PR 本文に「何を変えたか・根拠」を書く → PR を作成
4. 以後は自動:

```
PR 作成
  → 機械ゲート（content/ 配下のみ / 守備ファイル非変更 / 削除比率 30% 未満 / 外部リンク 5 件超禁止 / ビルド成功）
  → PASS → 自動マージ → LLM 監査 → デプロイ
  → FAIL → CHANGES_REQUESTED レビュー（理由がコメントで返ります）
```

## LLM 監査のしくみ

マージされたすべての変更は 2 段の審査を通ります。

**第 1 段: 機械ゲート（PR 段階）**
- 守備ファイル（ワークフロー・スクリプト・設定）の変更検出
- content/ 外への書き込み検出
- 削除比率・外部リンク数の閾値
- Quartz ビルドの成功確認

**第 2 段: LLM 監査（マージ後）**
- ローカル LLM（Strata / swift-1.5）がマージコミットの diff を判定: `PASS` / `REJECT` / `NEEDS_HUMAN`
- 第三者の REJECT → **自動 revert**（元に戻して PR にコメント）
- Wiki 管理者の編集 → 監査は走るが **advisory（参考意見）のみ**で自動 revert はしません（承認者は人間が頂点のため）
- 全判定は `audit/audit-log.jsonl` に来歴として記録されます

## 来歴（だれが何をしたか）

- Issue 起点: Issue 番号 → PR 番号 → コミットトレーラー（`requested by 依頼者`）→ 監査ログ
- PR 起点: PR 番号 → 作者 → 監査ログ
- どの経路も「人間の依頼 → LLM の実装 → 機械+LLM の審査 → 公開」の連鎖が GitHub 側に監査証跡として残ります

## 費用と運用

- 機械ゲート・監査・実装・公開はすべて自動化されており、運用コストはほぼゼロ（人間は抽查と承認ゲートのみ）
- LLM は自前マシン（RTX 3090 Ti / Strata）でローカル実行 — API 従量課金なし
- 公開は GitHub Pages（静的サイト）

## 関連

- [[rejects]] — 報告フォーム案内
- [[howto]] — EchoThread 設定
- [[format-test]] — 記法テストページ
