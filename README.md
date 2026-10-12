# ai-site-advisor

エリア・対象日・機種から、**ChatGPTへコピーして実行するホール検索プロンプト**を作るアプリです。ダーク配色、スマートフォン対応。

APIキー、API課金、CSV、DBは不要です。アプリからAIや調査先サイトへ入力を送信しません。実際の検索・調査は、ユーザーがChatGPTへ貼り付けて実行します。ChatGPTの機能・検索回数は利用プランと利用制限に従います。

## 使い方

1. エリア・範囲の目安・対象日・狙い機種を入力。
2. 必要なら「詳細設定」で調査先URL・希望を指定。
3. 「プロンプトを作成」を押す。
4. 「コピー」→「ChatGPTを開く」→貼り付けて実行。

コピーできないブラウザでは文章を選択し、手動コピーできます。条件を変えたときは再作成してください。`/demo` は入力例、`/settings` は使い方です。アプリ内でおすすめ結果や架空の点数を生成する画面はありません。

生成プロンプトには、実際のWeb検索が可能な場合だけ公開情報を調査すること、参照URL、参考スコアの根拠、掲載日、不明点を示すことを指定しています。実行結果の正確性・最新性は参照元で確認してください。

## 起動

Node.js 24系とnpmを使用します。

```sh
cd /workspace/ai-site-advisor
npm ci --cache /workspace/.npm-cache
npm run dev
```

環境変数・APIキーの設定はありません。入力と生成内容はブラウザのメモリにのみ保持し、再読込で消えます。アプリのサーバーに履歴を保存しません。ChatGPTへ貼り付けた後の内容は、ChatGPT側のデータ設定に従います。

## 検証

```sh
npm test
npm run typecheck
npm run build
npm start
npm run smoke
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --project=desktop --project=mobile-chromium
```

テストは条件反映、入力チェック、ネットワークなしでの生成、コピー・手動コピー、PC/iPhoneサイズの操作を確認します。ChatGPTの実際の回答やWeb検索性能を検証するものではありません。開発・E2Eとビルドは `.next` を共有するため同時に実行しないでください。

## 構成

- `src/lib/prompt-generator.ts`：条件と調査指示からプロンプト生成
- `src/lib/schema.ts`：入力チェック
- `src/components/research-app.tsx`：条件入力、生成、コピー
- `src/app/api/health/route.ts`：起動確認
- `tests/`：ロジックとブラウザ操作の検証

旧API版・CSV版の仕様は `docs/previous-*` に履歴として残しています。**現在の要件は [docs/requirements.md](docs/requirements.md)** です。旧コードは `/workspace/repository-backups/ai-site-advisor-api-before-prompt.tar` に保管しました。既存 `data/` を新アプリが読み書きすることはありません。

クラウドタスクは独立環境です。明示的な依頼がない限りGit worktreeを追加せず、既存チェックアウトで開発してください。
