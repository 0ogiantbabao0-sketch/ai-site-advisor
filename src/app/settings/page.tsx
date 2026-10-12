"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_PROMPT_TEMPLATE,
  PROMPT_STORAGE_KEY,
} from "@/lib/prompt-generator";
import { publicUrl } from "@/lib/schema";
export default function Settings() {
  const [template, setTemplate] = useState(DEFAULT_PROMPT_TEMPLATE);
  const [sites, setSites] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    try {
      setTemplate(
        localStorage.getItem(PROMPT_STORAGE_KEY) ?? DEFAULT_PROMPT_TEMPLATE,
      );
      setSites(localStorage.getItem("advisor.sites.v1") ?? "");
      setPassword(sessionStorage.getItem("advisor.access.v1") ?? "");
    } catch {
      setStatus("ブラウザの保存領域を利用できません。");
    }
  }, []);
  function save() {
    const urls = sites
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!template.trim() || !template.includes("{{検索条件}}")) {
      setStatus("{{検索条件}} を残してください。検索時に条件が入ります。");
      return;
    }
    if (urls.length > 5 || urls.some((url) => !publicUrl(url, true))) {
      setStatus("調査先は公開HTTPS URLを最大5件で指定してください。");
      return;
    }
    try {
      localStorage.setItem(PROMPT_STORAGE_KEY, template);
      localStorage.setItem("advisor.sites.v1", urls.join("\n"));
      sessionStorage.setItem("advisor.access.v1", password);
      setStatus("保存しました。");
    } catch {
      setStatus("保存できませんでした。ブラウザの保存設定を確認してください。");
    }
  }
  return (
    <div className="settings-page">
      <Link href="/">← 検索</Link>
      <h1>設定</h1>
      <section className="surface">
        <label>
          調査先URL
          <textarea
            rows={4}
            maxLength={2500}
            value={sites}
            onChange={(e) => setSites(e.target.value)}
            placeholder="店舗詳細・実績ページのHTTPS URL（1行1件・最大5件）"
          />
        </label>
        <label>
          利用パスワード
          <input
            type="password"
            autoComplete="off"
            maxLength={200}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <p className="muted">
          パスワードはCloudflareで登録したもの。このタブの間だけ保存します。
        </p>
        <label>
          調査プロンプト
          <textarea
            className="prompt-output"
            aria-label="調査プロンプト"
            rows={22}
            maxLength={12000}
            value={template}
            onChange={(e) => {
              setTemplate(e.target.value);
              setStatus("");
            }}
          />
        </label>
        <p className="muted">
          {
            "{{検索条件}} にエリア・日付・機種が入ります。プロンプトと調査先はこのブラウザに保存します。"
          }
        </p>
        <div className="prompt-actions">
          <button className="primary" type="button" onClick={save}>
            保存
          </button>
          <button
            type="button"
            onClick={() => {
              setTemplate(DEFAULT_PROMPT_TEMPLATE);
              setStatus("初期値に戻しました。保存すると反映されます。");
            }}
          >
            初期値に戻す
          </button>
        </div>
        <p role="status">{status}</p>
      </section>
    </div>
  );
}
