import assert from "node:assert/strict";
async function main() {
  const origin = process.env.SMOKE_ORIGIN || "http://127.0.0.1:3000";
  const health = await fetch(`${origin}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).mode, "prompt-generator");
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /プロンプトを作成/);
  assert.doesNotMatch(html, /APIキー未設定/);
  assert.equal(
    (await fetch(`${origin}/api/research`, { method: "POST", body: "{}" }))
      .status,
    404,
  );
  console.log(
    "HTTP smoke passed: prompt generator, no API-key setup, paid research route removed.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
