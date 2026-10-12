import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: process.env.CHROMIUM_PATH || undefined,
        },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        launchOptions: {
          executablePath: process.env.CHROMIUM_PATH || undefined,
        },
      },
    },
    { name: "iphone-webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command:
      process.env.STATIC_E2E === "1"
        ? "node node_modules/serve/build/main.js out --listen 3100 --no-clipboard"
        : "npm run dev -- --port 3100",
    env: { NO_UPDATE_CHECK: "1" },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
