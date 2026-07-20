import {
  GALLERY_HERO_INTRO_MS,
  GALLERY_HERO_INTRO_MS_TABLET,
  galleryRevealStaggerDelaySeconds,
  galleryRevealStaggerDelaySecondsTablet,
} from "../constants/gallery-reveal";
import { isMobileLayout, isTabletLayout } from "../constants/breakpoints";

function initGalleryScrollReveal(): void {
  const sections = Array.from(
    document.querySelectorAll(".gallery-page .gallery-page__section--reveal"),
  );
  if (!sections.length) return;

  const titleSelector = ".photo-gallery__title, .photo-art__title";
  const imageSelector =
    ".photo-gallery__item, .photo-art__item, .art__item, .gallery-content__featured, .gallery-content__item, .gallery-page__footer-heading, .contact-actions__link, .gallery-page__footer-lead, .gallery-page__footer-copy";

  const revealTarget = (target: Element) => {
    target.classList.add("gallery-page__target--visible");
  };

  const markReady = (section: Element) => {
    section.classList.add("gallery-page__section--intro-ready");
  };

  const isTablet = isTabletLayout();
  const getStaggerDelay = isTablet
    ? galleryRevealStaggerDelaySecondsTablet
    : galleryRevealStaggerDelaySeconds;

  const prepareTarget = (target: Element, index: number | null) => {
    const element = target as HTMLElement;
    target.classList.add("gallery-page__target");
    if (index !== null) {
      element.style.transitionDelay = `${getStaggerDelay(index)}s`;
    }
  };

  if (isMobileLayout()) {
    sections.forEach((section) => {
      markReady(section);
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

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sections.forEach((section) => {
      markReady(section);
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

  const heroIntroMs = isTablet
    ? GALLERY_HERO_INTRO_MS_TABLET
    : GALLERY_HERO_INTRO_MS;

  const heroIntroReady = new Promise<void>((resolve) => {
    window.setTimeout(resolve, heroIntroMs);
  });

  const revealPaintDelayMs = isTablet ? 80 : 48;

  const revealAfterPaint = (targets: Element[]) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          targets.forEach((target) => revealTarget(target));
        }, revealPaintDelayMs);
      });
    });
  };

  const isNearViewport = (target: Element) =>
    target.getBoundingClientRect().top < window.innerHeight * 0.92;

  const observeTarget = (target: Element) => {
    let revealed = false;
    const tryReveal = () => {
      if (revealed) return;
      revealed = true;
      revealTarget(target);
      observer.disconnect();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tryReveal();
        });
      },
      { threshold: 0, rootMargin: "0px 0px -2% 0px" },
    );

    observer.observe(target);

    if (isNearViewport(target)) {
      tryReveal();
    }
  };

  sections.forEach((section) => {
    const titles = Array.from(section.querySelectorAll(titleSelector));
    const images = Array.from(section.querySelectorAll(imageSelector));
    const waitForHeroIntro = section.classList.contains(
      "gallery-page__section--first",
    );

    titles.forEach((target) => prepareTarget(target, null));
    images.forEach((target, index) => prepareTarget(target, index));

    if (waitForHeroIntro) {
      void heroIntroReady.then(() => {
        markReady(section);
        void (section as HTMLElement).offsetWidth;

        // Only fly in what's on screen after intro; below-fold content waits for scroll.
        const immediate: Element[] = [];
        [...titles, ...images].forEach((target) => {
          if (isNearViewport(target)) {
            immediate.push(target);
          } else {
            observeTarget(target);
          }
        });
        revealAfterPaint(immediate);
      });
      return;
    }

    titles.forEach((target) => observeTarget(target));
    images.forEach((target) => observeTarget(target));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryScrollReveal);
} else {
  initGalleryScrollReveal();
}
