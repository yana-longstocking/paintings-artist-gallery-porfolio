import { scrollTo } from "../utils/scrollRoot";

function initGalleryScrollTop(): void {
  const bar = document.querySelector(".gallery-page__scroll-top-bar");
  const wrap = document.querySelector(".gallery-page__scroll-top-wrap");
  const accent = document.querySelector(".gallery-page__scroll-top-accent");
  const button = document.querySelector(".gallery-page__scroll-top");
  if (!bar || !wrap || !button) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const isVisible = entry.isIntersecting;
        wrap.classList.toggle(
          "gallery-page__scroll-top-wrap--visible",
          isVisible,
        );
        accent?.classList.toggle(
          "gallery-page__scroll-top-accent--visible",
          isVisible,
        );
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -5% 0px",
    },
  );

  observer.observe(bar);

  button.addEventListener("click", () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryScrollTop);
} else {
  initGalleryScrollTop();
}
