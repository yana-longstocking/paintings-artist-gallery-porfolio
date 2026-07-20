import type { Page } from "@playwright/test";

// Keep animation names (do not set `animation: none`) so `forwards` fill-mode
// still applies the end keyframe — many sections start at opacity: 0.
const DISABLE_ANIMATIONS_STYLE = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`;

/**
 * Production scroll uses `body` as the scrollport (`html { overflow: hidden }`).
 * Playwright full-page / element screenshots clip against that viewport, so for
 * captures we temporarily restore normal document flow.
 */
const UNLOCK_SCROLLPORT_STYLE = `
  html, body {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    overscroll-behavior: auto !important;
  }
`;

/**
 * Artwork detail uses a stretched flex row whose bounding box can end mid-gallery
 * when percentage heights resolve against an auto-sized body. Size to content
 * so element screenshots include the full detail panel.
 */
const ARTWORK_DETAIL_SCREENSHOT_STYLE = `
  .artwork-detail__wrapper--with-gallery {
    align-items: flex-start !important;
  }

  .artwork-detail__wrapper--with-gallery .artwork-detail__main-image {
    align-self: flex-start !important;
    height: auto !important;
  }

  .artwork-detail__wrapper--with-gallery .artwork-detail__image {
    height: auto !important;
  }

  .artwork-detail__wrapper--with-gallery .artwork-detail__additional-photos,
  .artwork-detail__wrapper--with-gallery .artwork-detail__gallery {
    flex: none !important;
  }

  .artwork-detail__wrapper--with-gallery .artwork-detail__gallery {
    grid-template-rows: auto auto !important;
  }

  .artwork-detail__wrapper--with-gallery .artwork-detail__gallery-item {
    height: auto !important;
    aspect-ratio: 1 / 1 !important;
  }
`;

export async function preparePageForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: [
      DISABLE_ANIMATIONS_STYLE,
      UNLOCK_SCROLLPORT_STYLE,
      ARTWORK_DETAIL_SCREENSHOT_STYLE,
    ].join("\n"),
  });
  await page.evaluate(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    const IMAGE_WAIT_MS = 8_000;

    for (const image of images) {
      if (image.loading === "lazy") {
        image.loading = "eager";
      }
    }

    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            const done = () => resolve();
            image.addEventListener("load", done, { once: true });
            image.addEventListener("error", done, { once: true });
            window.setTimeout(done, IMAGE_WAIT_MS);
          }),
      ),
    );
  });
  await page.evaluate(() => {
    document
      .querySelector(".artist-bio--reveal")
      ?.classList.add(
        "artist-bio--visible",
        "artist-bio--content-visible",
        "artist-bio--text-visible",
      );

    const footer = document.querySelector(".footer--scroll-reveal");
    if (footer) {
      footer
        .querySelector(".footer__form-section")
        ?.classList.add("footer__form-section--content-visible");
      footer
        .querySelector(".footer__contact-section")
        ?.classList.add("footer__contact-section--content-visible");
      footer.classList.add(
        "footer--heading-visible",
        "footer--button-visible",
        "footer--copyright-visible",
      );
    }

    const galleryRevealSelector =
      ".gallery-page__footer-heading, .gallery-page__footer-nav-link, .gallery-page__footer-inline-link, .gallery-page__footer-lead, .gallery-page__footer-classic-item, .gallery-page__footer-copy, .contact-action";

    document.querySelectorAll(galleryRevealSelector).forEach((target) => {
      target.classList.add(
        "gallery-page__target",
        "gallery-page__target--visible",
      );
    });

    document.querySelectorAll(".artwork-detail__target").forEach((target) => {
      target.classList.add("artwork-detail__target--visible");
    });
    document
      .querySelectorAll(
        [
          ".artwork-detail__main-image",
          ".artwork-detail__title",
          ".artwork-detail__description",
          ".artwork-detail__medium",
          ".artwork-detail__size",
          ".artwork-detail__price",
          ".artwork-detail__additional-title",
          ".artwork-detail__gallery-item",
          ".artwork-detail__footer-title",
          ".artwork-detail__footer-text",
          ".artwork-detail__footer-link",
          ".artwork-detail__footer-actions",
          ".artwork-detail__footer-copyright",
        ].join(", "),
      )
      .forEach((target) => {
        target.classList.add(
          "artwork-detail__target",
          "artwork-detail__target--visible",
        );
      });
  });

  // Let layout settle after reveal classes + image loads.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}
