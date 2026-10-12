import Link from "next/link";
export default function Guide() {
  return (
    <div className="settings-page">
      <Link href="/">← 検索</Link>
      <h1>使い方</h1>
      <section className="surface">
        <ol>
          <li>エリア・日付・機種を選ぶ。</li>
          <li>「プロンプトを作成」を押してコピーする。</li>
          <li>
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ChatGPT
            </a>
            に貼り付けて実行する。
          </li>
        </ol>
        <p className="muted">
          APIキー・API課金は不要です。ChatGPTの検索機能や回数は、利用プラン・利用制限に従います。
        </p>
      </section>
    </div>
  );
}
