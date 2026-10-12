import assert from "node:assert/strict";
async function main() {
  const origin = process.env.SMOKE_ORIGIN || "http://127.0.0.1:3000";
  for (const path of ["/", "/demo/", "/settings/"]) {
    const res = await fetch(`${origin}${path}`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, path === "/settings/" ? /調査プロンプト/ : /AIで調査/);
    assert.doesNotMatch(html, /APIキー未設定/);
  }
  const page = await fetch(origin),
    html = await page.text(),
    asset =
      html.match(/src="([^" ]+\/_next\/static\/[^" ]+\.js)"/)?.[1] ||
      html.match(/src="(\/_next\/static\/[^" ]+\.js)"/)?.[1];
  assert.ok(asset, "Next.js script asset missing");
  const res = await fetch(new URL(asset, origin));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type") || "", /javascript/);
  for (const path of ["/api/health"])
    assert.equal((await fetch(`${origin}${path}`)).status, 404);
  console.log(
    "HTTP smoke passed: home/example/settings and JavaScript assets (AI endpoint verified separately).",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
