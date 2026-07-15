import { TABLET_MIN_WIDTH } from "../constants/breakpoints";

function showMosaicCtaWhenReady() {
  const mosaic = document.querySelector(".hero-mosaic");
  if (!mosaic) return;

  if (!window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`).matches) {
    return;
  }

  const images = Array.from(
    mosaic.querySelectorAll<HTMLImageElement>(".hero-mosaic__img"),
  );
  const ctaWrap = mosaic.querySelector(".hero-mosaic__cta");
  const cta = mosaic.querySelector(".hero-mosaic__cta-link");
  if (!cta || !ctaWrap) return;

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    cta.classList.add("hero-mosaic__cta-link--ready");
  };

  const fallback = window.setTimeout(reveal, 10000);

  const revealAndClear = () => {
    window.clearTimeout(fallback);
    reveal();
  };

  const waitForImage = (img: HTMLImageElement) =>
    new Promise<void>((resolve) => {
      const finish = async () => {
        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            // Show CTA even if decode fails.
          }
        }
        resolve();
      };

      if (img.complete) {
        finish();
        return;
      }

      img.addEventListener("load", finish, { once: true });
      img.addEventListener("error", finish, { once: true });
    });

  const waitForLastCellAnimation = () =>
    new Promise<void>((resolve) => {
      const lastCell = mosaic.querySelector(".hero-mosaic__cell--g");
      let settled = false;

      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      if (!lastCell) {
        done();
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.setTimeout(resolve, 80);
        return;
      }

      const animationFallback = window.setTimeout(done, 2000);
      const enterAnim = lastCell
        .getAnimations()
        .find((anim) => anim.animationName === "hero-mosaic-cell-enter");

      if (enterAnim) {
        const timing = enterAnim.effect?.getComputedTiming?.() ?? {};
        const delay = Number(timing.delay) || 0;
        const duration = Number(timing.duration) || 1900;
        const revealAt = delay + duration * 0.5;

        if (enterAnim.playState === "finished") {
          window.clearTimeout(animationFallback);
          done();
          return;
        }

        const current = Number(enterAnim.currentTime) || 0;
        const waitMs = Math.max(0, revealAt - current);

        window.setTimeout(() => {
          window.clearTimeout(animationFallback);
          done();
        }, waitMs);
        return;
      }

      const onEnd = (event: AnimationEvent) => {
        if (event.target !== lastCell) return;
        lastCell.removeEventListener("animationend", onEnd);
        window.clearTimeout(animationFallback);
        done();
      };

      lastCell.addEventListener("animationend", onEnd);
    });

  const waitForMosaic = async () => {
    if (!images.length) {
      revealAndClear();
      return;
    }

    await Promise.all([
      Promise.all(images.map(waitForImage)),
      waitForLastCellAnimation(),
    ]);
    revealAndClear();
  };

  waitForMosaic();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showMosaicCtaWhenReady);
} else {
  showMosaicCtaWhenReady();
}
