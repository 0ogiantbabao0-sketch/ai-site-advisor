"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { todayJST, addDays } from "@/lib/dates";
import {
  defaultInput,
  generatePrompt,
  PROMPT_STORAGE_KEY,
  DEFAULT_PROMPT_TEMPLATE,
} from "@/lib/prompt-generator";
import type { ResearchInput } from "@/lib/types";
const machinePresets = [
  "Lパチスロ甲鉄城のカバネリ 海門決戦",
  "マイジャグラーV",
  "スマスロ北斗の拳",
];
export default function ResearchApp({
  initialInput,
  example = false,
}: {
  initialInput?: ResearchInput;
  example?: boolean;
}) {
  const [input, setInput] = useState<ResearchInput>(
      initialInput ?? (() => ({ ...defaultInput(), targetDate: "" })),
    ),
    [sites, setSites] = useState(initialInput?.preferredSites.join("\n") ?? ""),
    [other, setOther] = useState(""),
    [report, setReport] = useState(""),
    [sources, setSources] = useState<
      { url: string; status: string; reason?: string; truncated?: boolean }[]
    >([]),
    [retrievedAt, setRetrievedAt] = useState(""),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [generatedInput, setGeneratedInput] = useState("");
  // Static exports must use the visitor's current date, not the build date.
  useEffect(() => {
    setInput((current) =>
      current.targetDate ? current : { ...current, targetDate: todayJST() },
    );
  }, []);
  const output = useRef<HTMLElement>(null);
  const active = useRef(false);
  useEffect(() => {
    if (initialInput) return;
    try {
      setSites(localStorage.getItem("advisor.sites.v1") ?? "");
    } catch {}
  }, [initialInput]);
  const patch = (p: Partial<ResearchInput>) => {
    setInput((s) => ({ ...s, ...p }));
  };
  const payload = {
    ...input,
    preferredSites: sites
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const dirty = report && generatedInput !== JSON.stringify(payload);
  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (active.current) return;
    setError("");
    let template = DEFAULT_PROMPT_TEMPLATE;
    let password = "";
    try {
      template =
        localStorage.getItem(PROMPT_STORAGE_KEY) ?? DEFAULT_PROMPT_TEMPLATE;
      password = sessionStorage.getItem("advisor.access.v1") ?? "";
      generatePrompt(payload, template);
    } catch {
      setError("検索条件と設定画面のプロンプトを確認してください。");
      return;
    }
    if (!payload.preferredSites.length) {
      setError("設定画面または詳細設定で調査先URLを指定してください。");
      return;
    }
    if (!password) {
      setError("設定画面で利用パスワードを入力してください。");
      return;
    }
    active.current = true;
    setLoading(true);
    setReport("");
    setSources([]);
    setRetrievedAt("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ input: payload, template }),
      });
      const data = await response.json().catch(() => null);
      if (data?.sources) setSources(data.sources);
      if (data?.retrievedAt) setRetrievedAt(data.retrievedAt);
      if (!response.ok)
        throw new Error(data?.error ?? "AIの接続設定を確認してください。");
      if (typeof data?.report !== "string" || !data.report.trim())
        throw new Error("結果を取得できませんでした。");
      setReport(data.report);
      setGeneratedInput(JSON.stringify(payload));
      requestAnimationFrame(() =>
        output.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (error) {
      setError(
        error instanceof Error && error.name === "AbortError"
          ? "時間がかかりすぎました。しばらくして再実行してください。"
          : error instanceof Error
            ? error.message
            : "通信できませんでした。",
      );
    } finally {
      clearTimeout(timer);
      active.current = false;
      setLoading(false);
    }
  }
  return (
    <>
      {example && (
        <section className="demo-banner" aria-label="入力例">
          <strong>入力例</strong>
          <span>京都駅・マイジャグラーV</span>
          <Link href="/">通常画面 →</Link>
        </section>
      )}
      <section className="page-heading">
        <h1>ホール検索</h1>
      </section>
      <div className="workspace">
        <aside>
          <form className="search-panel" onSubmit={create}>
            <fieldset disabled={loading} className="search-fields">
              <h2>検索条件</h2>
              <label>
                エリア・駅
                <input
                  required
                  maxLength={120}
                  value={input.area}
                  onChange={(e) => patch({ area: e.target.value })}
                />
              </label>
              <div className="preset-grid">
                {["大阪駅・梅田駅", "京都駅", "長岡京駅", "高槻駅"].map(
                  (area) => (
                    <button
                      type="button"
                      key={area}
                      className={area === input.area ? "active" : ""}
                      onClick={() => patch({ area })}
                    >
                      {area}
                    </button>
                  ),
                )}
              </div>
              <div className="two-cols">
                <label>
                  範囲の目安
                  <select
                    aria-label="範囲の目安"
                    value={input.radius}
                    onChange={(e) => patch({ radius: Number(e.target.value) })}
                  >
                    {[5, 10, 20, 30, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}km
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  対象日
                  <input
                    type="date"
                    required
                    min="2020-01-01"
                    max="2100-12-31"
                    value={input.targetDate}
                    onChange={(e) => patch({ targetDate: e.target.value })}
                  />
                </label>
              </div>
              <div className="date-shortcuts">
                <button
                  type="button"
                  onClick={() => patch({ targetDate: todayJST() })}
                >
                  今日
                </button>
                <button
                  type="button"
                  onClick={() => patch({ targetDate: addDays(todayJST(), 1) })}
                >
                  明日
                </button>
                <span>日本時間</span>
              </div>
              <div className="section-divider" />
              <label>
                狙い機種 <small>最大5件</small>
              </label>
              <div className="machine-options">
                {[
                  ...machinePresets,
                  ...input.machines.filter((m) => !machinePresets.includes(m)),
                ].map((machine) => (
                  <label className="check-row" key={machine}>
                    <input
                      type="checkbox"
                      checked={input.machines.includes(machine)}
                      disabled={
                        !input.machines.includes(machine) &&
                        input.machines.length >= 5
                      }
                      onChange={(e) =>
                        patch({
                          machines: e.target.checked
                            ? [...input.machines, machine]
                            : input.machines.filter((m) => m !== machine),
                        })
                      }
                    />
                    <span>{machine}</span>
                  </label>
                ))}
              </div>
              <div className="add-machine">
                <input
                  aria-label="他の機種名"
                  maxLength={100}
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  placeholder="他の機種を追加"
                />
                <button
                  type="button"
                  disabled={!other.trim() || input.machines.length >= 5}
                  onClick={() => {
                    const value = other.trim();
                    if (!input.machines.includes(value))
                      patch({ machines: [...input.machines, value] });
                    setOther("");
                  }}
                >
                  追加
                </button>
              </div>
              <details className="advanced">
                <summary>詳細設定</summary>
                <label>
                  調査先URL <small>1行1件・最大5件</small>
                  <textarea
                    rows={3}
                    maxLength={2500}
                    value={sites}
                    onChange={(e) => {
                      setSites(e.target.value);
                    }}
                    placeholder="https://example.com"
                  />
                </label>
                <label>
                  重視したいこと
                  <textarea
                    rows={3}
                    maxLength={600}
                    value={input.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                    placeholder="例：駅から近い店舗を優先"
                  />
                </label>
              </details>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? "調査中…" : "AIで調査"} <span>→</span>
              </button>
            </fieldset>
            <p className="request-note">
              指定ページを取得し、条件と本文をCloudflare AIへ送信します。
            </p>
          </form>
        </aside>
        <section className="result-panel" ref={output} aria-label="調査結果">
          <div className="report-intro">
            <h2>調査結果</h2>
            <Link className="report-label" href="/settings/">
              設定
            </Link>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {dirty && (
            <p className="notice">
              条件を変更しました。再調査すると反映されます。
            </p>
          )}
          {loading && (
            <p role="status">公開ページを確認し、AIが比較しています…</p>
          )}
          {report ? (
            <div className="research-report">{report}</div>
          ) : !loading && !error ? (
            <div className="empty-state">
              <span className="empty-symbol" aria-hidden="true">
                ⌕
              </span>
              <h3>条件を入力して調査</h3>
            </div>
          ) : null}
          {sources.length > 0 && (
            <section className="source-list" aria-label="取得した資料">
              <h3>確認したページ</h3>
              {sources.map((source, index) => (
                <p key={`${index}:${source.url}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.url}
                  </a>
                  <br />
                  <small>
                    {source.status === "ok"
                      ? "本文取得済み"
                      : `取得できず：${source.reason ?? "未確認"}`}
                    {source.truncated ? "（本文の先頭部分）" : ""}
                  </small>
                </p>
              ))}
              {retrievedAt && (
                <p className="muted">
                  取得日時：
                  {new Date(retrievedAt).toLocaleString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                  })}
                  （日本時間）
                </p>
              )}
            </section>
          )}
        </section>
      </div>
    </>
  );
}
