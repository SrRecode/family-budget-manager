import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./showcase/test-results",
  reporter: "list",

  use: {
    browserName: "chromium",
    headless: true,
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    screenshot: "on",
    video: "on",
    trace: "retain-on-failure",
  },
});
