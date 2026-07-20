import { scrollTo } from "../utils/scrollRoot";

function initArtworkDetailScrollTop(): void {
  const bar = document.querySelector(".artwork-detail__scroll-top-bar");
  const wrap = document.querySelector(".artwork-detail__scroll-top-wrap");
  const accent = document.querySelector(".artwork-detail__scroll-top-accent");
  const button = document.querySelector(".artwork-detail__scroll-top");
  if (!bar || !wrap || !button) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const isVisible = entry.isIntersecting;
        wrap.classList.toggle(
          "artwork-detail__scroll-top-wrap--visible",
          isVisible,
        );
        accent?.classList.toggle(
          "artwork-detail__scroll-top-accent--visible",
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

  let pointerStartY = 0;

  const scrollToTop = (): void => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
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
  document.addEventListener("DOMContentLoaded", initArtworkDetailScrollTop);
} else {
  initArtworkDetailScrollTop();
}
