import { test, expect } from "@playwright/test";
test("settings persist edited prompt and URLs; button runs research and displays evidence", async ({
  page,
}) => {
  await page.goto("/settings/");
  await page
    .getByLabel("調査先URL", { exact: true })
    .fill("https://example.com/hall");
  await page
    .getByLabel("利用パスワード", { exact: true })
    .fill("test-password");
  await page
    .getByLabel("調査プロンプト", { exact: true })
    .fill("日本語で比較: {{検索条件}}");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("保存しました。");
  await page.reload();
  await expect(page.getByLabel("調査プロンプト", { exact: true })).toHaveValue(
    "日本語で比較: {{検索条件}}",
  );
  await page.getByRole("link", { name: "← 検索" }).click();
  await page.getByRole("button", { name: "京都駅", exact: true }).click();
  await page.route("**/api/research", async (route) => {
    expect(route.request().headers().authorization).toBe(
      "Bearer test-password",
    );
    const body = route.request().postDataJSON();
    expect(body.template).toBe("日本語で比較: {{検索条件}}");
    expect(body.input.area).toBe("京都駅");
    expect(body.input.preferredSites).toEqual(["https://example.com/hall"]);
    await route.fulfill({
      json: {
        report: "確認資料に基づく候補。根拠不足の項目は評価保留。",
        sources: [{ url: "https://example.com/hall", status: "ok" }],
        retrievedAt: "2026-10-13T01:00:00Z",
      },
    });
  });
  await page.getByRole("button", { name: /AIで調査/ }).click();
  await expect(page.locator(".research-report")).toContainText("評価保留");
  await expect(
    page.getByRole("region", { name: "取得した資料" }),
  ).toContainText("本文取得済み");
  await expect(
    page.getByRole("link", { name: "https://example.com/hall", exact: true }),
  ).toHaveAttribute("href", "https://example.com/hall");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("missing setup and quota errors are shown without fabricated results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /AIで調査/ }).click();
  await expect(page.locator(".error[role=alert]")).toContainText("調査先URL");
  await page.goto("/settings/");
  await page
    .getByLabel("調査先URL", { exact: true })
    .fill("https://example.com/hall");
  await page
    .getByLabel("利用パスワード", { exact: true })
    .fill("test-password");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await page.goto("/");
  await page.route("**/api/research", (route) =>
    route.fulfill({
      status: 503,
      json: {
        error: "無料枠の残量を確認してください。",
        sources: [{ url: "https://example.com/hall", status: "ok" }],
      },
    }),
  );
  await page.getByRole("button", { name: /AIで調査/ }).click();
  await expect(page.locator(".error[role=alert]")).toContainText("無料枠");
  await expect(page.locator(".research-report")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /AIで調査/ })).toBeEnabled();
});
test("settings require conditions placeholder and visitor date uses JST", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2030-04-15T21:00:00Z"));
  await page.goto("/");
  await expect(page.getByLabel("対象日", { exact: true })).toHaveValue(
    "2030-04-16",
  );
  await page.goto("/settings/");
  await page
    .getByLabel("調査プロンプト", { exact: true })
    .fill("missing conditions");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("{{検索条件}}");
});
