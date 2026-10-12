# Cloudflare Pagesで公開

このアプリは静的サイトです。APIキー、Functions、Workers、DBの設定は不要です。無料プランのCloudflare Pagesで公開する構成です。ChatGPT側の利用制限は別です。

## GitHub連携（推奨）

1. Cloudflareダッシュボードで **Workers & Pages → 作成 → Pages → GitHub連携** を選びます。
2. GitHubの `0ogiantbabao0-sketch/ai-site-advisor` を選択します。見つからない場合はCloudflareのGitHubアプリにこのリポジトリへのアクセスを許可します。
3. 次の値で保存・デプロイします。

| 項目                   | 設定                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| プロジェクト名         | `ai-site-advisor`（使用済みなら別名）                                   |
| 本番ブランチ           | `main`                                                                  |
| フレームワーク         | `Next.js (Static HTML Export)`                                          |
| ビルドコマンド         | `npm run build`                                                         |
| ビルド出力ディレクトリ | `out`                                                                   |
| ルートディレクトリ     | リポジトリのルート（空欄）                                              |
| Node.js                | `.node-version` の `24.19.0`。必要ならビルド変数 `NODE_VERSION=24.19.0` |

`Next.js` のWorkers向け設定や `@cloudflare/next-on-pages` は使用しません。Pagesの静的サイトとして公開します。Cloudflareの画面名称が変わっている場合も、Git連携のPagesと上記ビルド値を選んでください。

完了するとCloudflareが `https://...pages.dev` のURLを表示します。そのURLをスマートフォンで開きます。GitHubにpushした更新は自動的に再ビルド・公開されます。

## ZIPを直接アップロード

Git連携せず公開する場合は、Cloudflareの **Pages → アセットをアップロード（Direct Upload）** で、用意した `ai-site-advisor-cloudflare.zip` をアップロードします。ZIPの直下に `index.html` と `_next/` がある必要があります。

ローカルで作り直す場合：

```sh
npm ci
npm run build
```

`out/` の内容をZIPにします。`out` フォルダーそのもの、Git、node_modules、ソースコードをZIPに含めないでください。更新のたびに新しいZIPをアップロードします。Git連携による自動反映が必要なら最初からGit連携方式を選んでください。

## 公開後の確認

- トップ画面・`/demo/`・`/settings/` が開く。
- プロンプト作成・コピーが動く。HTTPS上でクリップボードが利用できます。
- ページを開いた日の日本時間が対象日の初期値になる。
- 「ChatGPTを開く」でChatGPTに移動し、貼り付けて実行できる。

アプリから自動でChatGPTへ送信する処理はありません。

## この環境での確認範囲

静的出力の生成、静的ファイル配信でのPC・iPhoneサイズのブラウザ操作、未来の端末日時による日本時間の初期日付を検証しました。Cloudflareアカウントの認証はこの環境にないため、Cloudflareへの実アップロードと公開URLの動作確認はユーザーのダッシュボードでの公開後に行う必要があります。

公式手順：
https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
