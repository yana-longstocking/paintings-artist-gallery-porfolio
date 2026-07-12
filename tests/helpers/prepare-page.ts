import type { Page } from "@playwright/test";

const DISABLE_ANIMATIONS_STYLE = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`;

export async function preparePageForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({ content: DISABLE_ANIMATIONS_STYLE });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const images = Array.from(document.images);

    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    );
  });
}
