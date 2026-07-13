function initGalleryScrollTop(): void {
  const bar = document.querySelector(".gallery-page__scroll-top-bar");
  const wrap = document.querySelector(".gallery-page__scroll-top-wrap");
  const button = document.querySelector(".gallery-page__scroll-top");
  if (!bar || !wrap || !button) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        wrap.classList.toggle(
          "gallery-page__scroll-top-wrap--visible",
          entry.isIntersecting,
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
    window.scrollTo({
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
