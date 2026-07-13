function initGalleryScrollReveal(): void {
  const sections = Array.from(
    document.querySelectorAll(".gallery-page .gallery-page__section--reveal"),
  );
  if (!sections.length) return;

  const titleSelector = ".photo-gallery__title, .photo-art__title";
  const imageSelector =
    ".photo-gallery__item, .photo-art__item, .art__item, .gallery-content__featured, .gallery-content__item, .gallery-page__footer-heading, .gallery-page__footer-nav-link, .gallery-page__footer-inline-link, .contact-action, .gallery-page__footer-lead, .gallery-page__footer-classic-item, .gallery-page__footer-copy";

  const revealTarget = (target: Element) => {
    target.classList.add("gallery-page__target--visible");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sections.forEach((section) => {
      section
        .querySelectorAll(`${titleSelector}, ${imageSelector}`)
        .forEach((target) => {
          target.classList.add(
            "gallery-page__target",
            "gallery-page__target--visible",
          );
        });
    });
    return;
  }

  sections.forEach((section) => {
    const titles = Array.from(section.querySelectorAll(titleSelector));
    const images = Array.from(section.querySelectorAll(imageSelector));

    const observeTarget = (target: Element, index: number | null) => {
      target.classList.add("gallery-page__target");
      if (index !== null) {
        (target as HTMLElement).style.setProperty("--reveal-i", String(index));
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealTarget(entry.target);
            observer.disconnect();
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
      );

      observer.observe(target);

      if (target.getBoundingClientRect().top < window.innerHeight * 0.92) {
        revealTarget(target);
        observer.disconnect();
      }
    };

    titles.forEach((target) => observeTarget(target, null));
    images.forEach((target, index) => observeTarget(target, index));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryScrollReveal);
} else {
  initGalleryScrollReveal();
}
