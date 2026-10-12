# ai-site-advisor

ダークなスマホ対応画面から、指定した公開ページを取得してCloudflare Workers AIでホール候補を比較します。データベースとOpenAI APIキーは使用しません。

## 使い方

1. CloudflareでAI接続・利用パスワード・許可ドメインを設定する（[公開手順](docs/cloudflare.md)）。
2. アプリの「設定」で調査先URL、利用パスワード、調査プロンプトを保存する。
3. 検索画面でエリア・日付・機種を選び「AIで調査」を押す。
4. 結果と実際に取得したページを確認する。

プロンプトの `{{検索条件}}` に入力条件が入ります。プロンプトと調査先はブラウザのlocalStorage、パスワードはこのタブのsessionStorageに保存します。保存エラーも画面に表示します。

## 無料枠と調査範囲

Cloudflare Workers AIは1日10,000 Neuronsの無料枠があります。Freeプランでは上限到達時にAI実行が失敗します。回数は入力・出力の長さによって変わります。Workers Paidへ変更すると超過分が課金対象になるため、無料運用ではFreeプランを維持してください。Pages Functionsのリクエスト枠も適用されます。

Web全体の検索機能はありません。指定URLのHTML・テキスト本文だけを取得し、リンク先は巡回しません。取得は最大5ページ、各ページ250KBまで、AIへの資料は先頭6,000文字までです。JavaScriptで表示する内容、ログイン必須ページ、閲覧制限、PDF、画像内の実績は読み取りません。取得失敗は表示し、全件失敗ならAIを呼ばず終了します。採点はAIによる参考評価です。

## 開発

Node 24.19.0、npm。`npm ci`、`npm run build`、`npm start` で静的画面を確認できます。`npm start` / `npm run dev` ではCloudflare Functionsは動きません。

- `npm test`: 検索条件、資料取得、認証、失敗時の処理（AIはモック）
- `npm run typecheck`: 型検査
- `npm run build`: Next.js静的出力 `out/`
- `npx wrangler pages functions build functions --outdir /tmp/advisor-functions`: Functionsのバンドル検証（AI呼出なし）
- `STATIC_E2E=1 CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --project=desktop --project=mobile-chromium`: 静的UI＋APIモック

実際のAI接続にはCloudflare上のBindingsと秘密情報が必要です。ローカルから実AIを呼ぶWrangler実行もAI枠を消費します。
