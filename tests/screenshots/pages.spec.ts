import { test, expect, type Page } from "@playwright/test";
import { preparePageForScreenshot } from "../helpers/prepare-page";

const ARTWORK_ID = "series-freedom-alone";

const PAGE_SCREENSHOT = { fullPage: true, maxDiffPixelRatio: 0.001 };
const SECTION_SCREENSHOT = { maxDiffPixelRatio: 0.005 };

async function gotoAndPrepare(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "load" });
  await preparePageForScreenshot(page);
}

test.describe("page screenshots", () => {
  test("home page", async ({ page }) => {
    await gotoAndPrepare(page, "/");

    await expect(page).toHaveScreenshot("home-page.png", PAGE_SCREENSHOT);
    await expect(page.locator(".hero-mosaic-viewport")).toHaveScreenshot(
      "home-hero.png",
      SECTION_SCREENSHOT,
    );
  });

  test("gallery page", async ({ page }) => {
    await gotoAndPrepare(page, "/gallery");

    await expect(page).toHaveScreenshot("gallery-page.png", PAGE_SCREENSHOT);
    await expect(page.locator(".gallery-page__hero")).toHaveScreenshot(
      "gallery-hero.png",
      SECTION_SCREENSHOT,
    );
  });

  test("artwork page", async ({ page }) => {
    await gotoAndPrepare(page, `/artwork/${ARTWORK_ID}`);

    await expect(page).toHaveScreenshot("artwork-page.png", PAGE_SCREENSHOT);
    await expect(page.locator(".artwork-detail__wrapper")).toHaveScreenshot(
      "artwork-detail.png",
      SECTION_SCREENSHOT,
    );
  });
});
