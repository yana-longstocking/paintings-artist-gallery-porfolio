import { isTabletLayout } from "../constants/breakpoints";
import {
  scrollTo,
  SMOOTH_SCROLL_TIMING_GALLERY,
  SMOOTH_SCROLL_TIMING_GALLERY_TABLET,
} from "../utils/scrollRoot";

function initGalleryScrollTop(): void {
  const bar = document.querySelector(".gallery-page__scroll-top-bar");
  const wrap = document.querySelector(".gallery-page__scroll-top-wrap");
  const accent = document.querySelector(".gallery-page__scroll-top-accent");
  const button = document.querySelector(".gallery-page__scroll-top");
  if (!bar || !wrap || !button) return;

  const setVisible = (isVisible: boolean): void => {
    wrap.classList.toggle("gallery-page__scroll-top-wrap--visible", isVisible);
    accent?.classList.toggle(
      "gallery-page__scroll-top-accent--visible",
      isVisible,
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        setVisible(entry.isIntersecting);
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -5% 0px",
    },
  );

  observer.observe(bar);

  let pointerStartY = 0;

  const scrollToTop = (): void => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const scrollTiming = isTabletLayout()
      ? SMOOTH_SCROLL_TIMING_GALLERY_TABLET
      : SMOOTH_SCROLL_TIMING_GALLERY;

    scrollTo(
      {
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      },
      scrollTiming,
    );
  };

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStartY = event.clientY;
  });

  button.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (Math.abs(event.clientY - pointerStartY) > 8) return;

    event.preventDefault();
    if (button instanceof HTMLButtonElement) {
      button.blur();
    }
    scrollToTop();
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    scrollToTop();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryScrollTop);
} else {
  initGalleryScrollTop();
}
