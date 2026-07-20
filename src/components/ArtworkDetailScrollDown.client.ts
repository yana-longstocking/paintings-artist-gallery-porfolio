import { isMobileLayout } from "../constants/breakpoints";
import { scrollTo, SMOOTH_SCROLL_TIMING_FAST } from "../utils/scrollRoot";

function initArtworkDetailScrollDown(): void {
  const wrap = document.querySelector(".artwork-detail__scroll-down-wrap");
  const accent = document.querySelector(".artwork-detail__scroll-down-accent");
  const button = document.querySelector(".artwork-detail__scroll-down");
  if (!wrap || !button) return;

  if (!isMobileLayout()) return;

  const setVisible = (isVisible: boolean): void => {
    wrap.classList.toggle(
      "artwork-detail__scroll-down-wrap--visible",
      isVisible,
    );
    accent?.classList.toggle(
      "artwork-detail__scroll-down-accent--visible",
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
      threshold: 0.4,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  observer.observe(wrap);

  const scrollToTop = (): void => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollTo(
      {
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      },
      SMOOTH_SCROLL_TIMING_FAST,
    );
  };

  let pointerStartY = 0;

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
  document.addEventListener("DOMContentLoaded", initArtworkDetailScrollDown);
} else {
  initArtworkDetailScrollDown();
}
