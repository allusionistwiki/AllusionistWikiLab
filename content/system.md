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
| コメントする | EchoThread（匿名可・主運用） | 不要 |

すべての入力は同じパイプライン（トリアージ → 機械ゲート → LLM 監査 → 公開）に収束し、Wiki 本体を直接汚染しません。

## コメントの構成（EchoThread 主運用 + giscus バックアップ）

- **表示は EchoThread のみ**（匿名ゲスト投稿可・日本語化済み）。giscus ウィジェットはページから外しました
- **バックアップ**: 回収パイプラインが EchoThread コメントを GitHub Discussions（giscus の実体）へ自動ミラーします。コメントの内容が GitHub 側（git 連携・エクスポート可能）に二重に保存される構成です
- 移行時の扱い: EchoThread が終了・有料化しても、Discussions 側（`gh` CLI・GitHub UI で全取得可能）に全文が残るためコメント資産を失いません

## 報告の自動回収（Tally / EchoThread → Issue）

フォームとコメントは毎時の回収ジョブで **triage Issue へ自動起票**されます（新規 0 件なら無通知）。

- Tally 回答: 対象ページ URL・主張 ID はページ右上リンクから自動入力、名前既定値あり。種別が**「編集提案」なら `llm-task` ラベルも自動付与**（人間承認なしで実装経路へ進む。防御は機械ゲート + NO-OP 条項 + LLM 監査の 3 層）
- EchoThread コメント: 全文 + 投稿者 + 日時を Issue 化し、同時に Discussions へミラー
- 起票済み ID は状態ファイルで重複起票なし

### 回収頻度と API コスト（毎時にした理由）

回収は「pull 型（聞きに行く）」なので頻度はこちらの設定次第です。1 回あたりのリクエスト数はリポジトリ数ではなく、**EchoThread はページ数、Tally は新規回答数**に比例します。

| 経路 | 1 回あたりのリクエスト数 | 根拠 |
|---|---|---|
| EchoThread | ページ数 × 2（thread 取得 + comments 取得） | embed API が `page_url` キーでスレッドを返す作り。対象は content/ 配下の全ページ |
| Tally | 1 + 新規回答数（一覧 1 本 + 新規 submission 詳細） | 通常 1〜2 本 |
| GitHub（Issue 起票・コメント） | 数本 | 5,000 本/時の制限に対して無視できる量 |

- **GitHub 由来の入力（Issue / PR / ラベル付与）は毎時polling ではない** — Actions が数秒で発火するイベント駆動（poll 制約なし）
- Lab 規模（約 10 ページ）では毎時で約 20 リクエスト/時。Tally API は Free で無料・制限緩め、EchoThread 公開 API は bot トラフィックに敏感なため**毎時は安全域**（10〜15 分刻みも実運用範囲、1 分刻みは遮断リスク）
- **本番 Wiki2（約 7,400 ページ）へ持ち込むと 1 回約 15,000 リクエストで破綻する**。本番移行時の設計:
  1. 対象を「コメントが 1 件以上あるページ」に絞る（初回のみ全ページ、以後は既知スレッド + 新規は sitemap 差分検知）
  2. EchoThread ダッシュボードの JSON エクスポート（日次 1 本）+ 起票済み ID 差分
  3. 収集頻度を日次に落とす
- さらに速くしたい場合の選択肢: cron を 15 分刻みに（無料）/ Tally Webhook（Starter $5/月、送信直後に受け取る完全プッシュ型、受信エンドポイントが必要）

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

## 移行とバックアップ（データ資産の所在）

| 資産 | 正（一次保存） | バックアップ / エクスポート経路 |
|---|---|---|
| Wiki 本文（content/） | git（本 repo） | git clone で完全移行可能 |
| 報告・依頼（Issue / PR） | GitHub | `gh api` / `gh export` で全件取得、来歴はコミットトレーラーに二重化 |
| コメント本文 | EchoThread | **Discussions へ自動ミラー済み**（`gh` で全取得可）。EchoThread ダッシュボードの JSON エクスポートも可 |
| フォーム回答 | Tally | CSV エクスポート + API（`GET /forms/{id}/submissions`）。起票後は Issue として GitHub 側に残る |
| 監査ログ | `audit/audit-log.jsonl`（git） | git 由来 |
| 回収状態（重複防止） | 回収マシンの状態ファイル | 消失しても再起票されるだけでデータ損失なし |

**本番 Wiki2 への移行手順**（Lab で板についた後の手順）:

1. Tally フォームを新規作成（名前既定値 `AllusionistWiki`、hidden field `url` / `claim` + デフォルト回答の**選択**紐付け）
2. 回収スクリプトの repo / サイト / フォーム ID / ページ一覧を本産向けに設定（ページ一覧は content ツリーから自動生成）
3. EchoThread に本産ドメインを登録（Free 枠は 1 サイトなので Lab からの切替登録）、giscus は本産 repo の repoId（GraphQL node ID）で Discussions バックアップ継続
4. 監査 runner と Environment secrets はそのまま（localhost 経路）、機械ゲートの守備ファイル定義のみ本産構造に調整

**単一障害点と緩和**: EchoThread 障害・サービス終了 → Discussions ミラーで全文保持。Tally 障害 → 回答は CSV/API で取り出し済み、Issue 化済み分は GitHub 側に独立。runner 停止 → 機械ゲート（GitHub 側）は動き続け、LLM 監査のみ遅延。

## 関連

- [[rejects]] — 報告フォーム案内
- [[howto]] — EchoThread 設定
- [[format-test]] — 記法テストページ
