import { defineConfig, devices } from "@playwright/test";

const PREVIEW_PORT = 4321;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate:
    "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",
  use: {
    baseURL: PREVIEW_URL,
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    trace: "on-first-retry",
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${PREVIEW_PORT}`,
    url: PREVIEW_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
