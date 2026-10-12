"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { todayJST, addDays } from "@/lib/dates";
import { defaultInput, generatePrompt } from "@/lib/prompt-generator";
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
    [prompt, setPrompt] = useState(""),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false),
    [generatedInput, setGeneratedInput] = useState("");
  // Static exports must use the visitor's current date, not the build date.
  useEffect(() => {
    setInput((current) =>
      current.targetDate ? current : { ...current, targetDate: todayJST() },
    );
  }, []);
  const textarea = useRef<HTMLTextAreaElement>(null),
    output = useRef<HTMLElement>(null);
  const patch = (p: Partial<ResearchInput>) => {
    setInput((s) => ({ ...s, ...p }));
    setCopied(false);
  };
  const payload = {
    ...input,
    preferredSites: sites
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const dirty = prompt && generatedInput !== JSON.stringify(payload);
  function create(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setCopied(false);
    try {
      setPrompt(generatePrompt(payload));
      setGeneratedInput(JSON.stringify(payload));
      requestAnimationFrame(() =>
        output.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch {
      setError("エリア・日付・機種・調査先URLを確認してください。");
    }
  }
  async function copy() {
    setError("");
    try {
      if (!navigator.clipboard?.writeText) throw new Error();
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
      textarea.current?.focus();
      textarea.current?.select();
      setError(
        "コピーできませんでした。選択中の文章を手動でコピーしてください。",
      );
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
                    setCopied(false);
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
            <button type="submit" className="primary">
              プロンプトを作成 <span>→</span>
            </button>
            <p className="request-note">
              APIキー不要。アプリから外部への送信はありません。
            </p>
          </form>
        </aside>
        <section
          className="result-panel"
          ref={output}
          aria-label="作成したプロンプト"
        >
          <div className="report-intro">
            <h2>プロンプト</h2>
            <span className="report-label">ChatGPT用</span>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {dirty && (
            <p className="notice">
              条件を変更しました。再作成すると反映されます。
            </p>
          )}
          {prompt ? (
            <>
              <div className="prompt-actions">
                <button type="button" className="primary" onClick={copy}>
                  {copied ? "コピーしました" : "コピー"}
                </button>
                <a
                  className="chatgpt-link"
                  href="https://chatgpt.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ChatGPTを開く ↗
                </a>
              </div>
              <p className="request-note" role="status">
                {copied
                  ? "ChatGPTに貼り付けて実行してください。"
                  : "コピーしてChatGPTに貼り付けます。"}
              </p>
              <textarea
                ref={textarea}
                aria-label="生成したプロンプト"
                className="prompt-output"
                readOnly
                value={prompt}
                rows={20}
              />
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-symbol" aria-hidden="true">
                ⌕
              </span>
              <h3>条件を入力して作成</h3>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
