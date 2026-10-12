import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "ai-site-advisor | ホール検索プロンプト",
  description: "条件からChatGPT用のホール検索プロンプトを作成します。",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-icon">ai</span>
            <span>ai-site-advisor</span>
          </Link>
          <nav aria-label="メインナビ">
            <Link href="/">検索</Link>
            <Link href="/settings">使い方</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>ChatGPTにコピーして実行</footer>
      </body>
    </html>
  );
}
