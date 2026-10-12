# Cloudflare PagesでAIを実行する

既存のGitHub連携Pagesを使います。静的画面に加え、`functions/api/research.ts` が `/api/research` を担当します。ZIPを画面へアップロードするだけではFunctionsが公開されないため、GitHub連携でデプロイしてください。

## ビルド設定（既存のまま）

- リポジトリ: `0ogiantbabao0-sketch/ai-site-advisor`
- ブランチ: `main`
- ビルド: `npm run build`
- 出力: `out`
- ルート: 空欄
- Node: `.node-version` の24.19.0

## AI接続と設定

Cloudflare → Workers & Pages → `ai-site-advisor` → Settings。

1. Bindings → Add → Workers AI。変数名を **`AI`** にする。本番環境を対象に設定する。
2. Variables and Secretsで以下を本番環境に登録する。
   - **`RESEARCH_PASSWORD`**: Secret。自分で作った長い利用パスワード。チャットやGitHubには書かない。
   - **`ALLOWED_SITE_HOSTS`**: 通常の変数。調査先の正確なホスト名をカンマ区切りにする。例: `www.example.com,results.example.com`（実際に使うサイトに置き換える）。URL全体やパス、ワイルドカードは指定しない。
3. 設定を保存して再デプロイする（Deployments → 最新デプロイ → Retry deployment）。
4. 公開アプリの「設定」で、調査先の店舗・実績ページURLと同じ利用パスワードを入力して保存する。
5. 条件を選び「AIで調査」を押す。

ドメインは完全一致です。リダイレクト先も同じ許可一覧で検証するので、`www` の有無や別ドメインへの移動に注意してください。アプリ側でURLを編集しても、サーバーの許可一覧は変更されません。

AIモデルは無料枠対象の `@cf/meta/llama-3.3-70b-instruct-fp8-fast` を使用します。Freeプランを維持してください。Workers Paidでは無料枠超過分に課金が発生します。AI無料枠はアカウント内の他のAI使用と共有されます。上限時は画面にエラーを表示し、有料AIへの切替や自動再試行はしません。

## 確認

- `/`、`/settings/`、`/demo/` が表示される。
- 設定した調査先URLとプロンプトが再読込後も残る。
- 「AIで調査」で取得ページと結果が表示される。
- 未設定は503、パスワード不一致は401、未許可URLは400、全件取得失敗は422。
- AI実行失敗は503（無料枠、AI Binding、モデルの利用可否を確認）。

プレビュー環境で実行する場合は、その環境にもBindingsと変数が必要です。実際のサイトによっては取得拒否や動的表示があり、本文を読み取れません。閲覧制限を回避する仕組みはありません。

公式資料:
- https://developers.cloudflare.com/pages/functions/bindings/#workers-ai
- https://developers.cloudflare.com/workers-ai/platform/pricing/
