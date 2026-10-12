import { test, expect } from "@playwright/test";
test("conditions generate a prompt, copy exact contents and expose ChatGPT link without API calls", async ({
  page,
}, testInfo) => {
  const calls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) calls.push(r.url());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copiedPrompt: string }).copiedPrompt = text;
        },
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "京都駅", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "マイジャグラーV", exact: true })
    .check();
  await page.getByLabel("範囲の目安", { exact: true }).selectOption("20");
  await page.getByLabel("対象日", { exact: true }).fill("2026-10-12");
  await page.getByText("詳細設定", { exact: true }).click();
  await page.getByLabel(/調査先URL/).fill("https://example.com/hall");
  await page
    .getByLabel("重視したいこと", { exact: true })
    .fill("駅から近い店舗を優先");
  await page.getByRole("button", { name: /プロンプトを作成/ }).click();
  const output = page.getByLabel("生成したプロンプト", { exact: true });
  const text = await output.inputValue();
  expect(text).toContain("京都駅");
  expect(text).toContain("マイジャグラーV");
  expect(text).toContain("https://example.com/hall");
  await page.getByRole("button", { name: "コピー", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("貼り付け");
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedPrompt: string }).copiedPrompt,
    ),
  ).toBe(text);
  await expect(
    page.getByRole("link", { name: /ChatGPTを開く/ }),
  ).toHaveAttribute("href", "https://chatgpt.com/");
  expect(calls).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/free-prompt-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "高槻駅", exact: true }).click();
  await expect(
    page.getByText("条件を変更しました。", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: /プロンプトを作成/ }).click();
  await expect(output).toHaveValue(/高槻駅/);
  await expect(
    page.getByRole("button", { name: "コピー", exact: true }),
  ).toBeVisible();
});
test("unavailable clipboard offers manual copy; invalid site leaves no generated result", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
  });
  await page.goto("/");
  await page.getByText("詳細設定", { exact: true }).click();
  await page.getByLabel(/調査先URL/).fill("javascript:alert(1)");
  await page.getByRole("button", { name: /プロンプトを作成/ }).click();
  await expect(page.locator(".error[role=alert]")).toBeVisible();
  await expect(
    page.getByLabel("生成したプロンプト", { exact: true }),
  ).toHaveCount(0);
  await page.getByLabel(/調査先URL/).fill("");
  await page.getByRole("button", { name: /プロンプトを作成/ }).click();
  await page.getByRole("button", { name: "コピー", exact: true }).click();
  await expect(page.locator(".error[role=alert]")).toContainText(
    "手動でコピー",
  );
  expect(
    await page
      .getByLabel("生成したプロンプト")
      .evaluate(
        (element: HTMLTextAreaElement) =>
          element.selectionEnd - element.selectionStart,
      ),
  ).toBeGreaterThan(100);
});
test("example is preset conditions, not fake recommendations; guide needs no API setup", async ({
  page,
  request,
}) => {
  await page.goto("/demo");
  await expect(page.getByRole("region", { name: "入力例" })).toBeVisible();
  await page.getByRole("button", { name: /プロンプトを作成/ }).click();
  await expect(page.getByLabel("生成したプロンプト")).toHaveValue(/京都駅/);
  await expect(page.locator(".recommendation")).toHaveCount(0);
  await page.getByRole("link", { name: "使い方", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "使い方", exact: true }),
  ).toBeVisible();
  expect((await request.post("/api/research", { data: {} })).status()).toBe(
    404,
  );
});
