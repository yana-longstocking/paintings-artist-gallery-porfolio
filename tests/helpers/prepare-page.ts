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
}
