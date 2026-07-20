import {
  GALLERY_HERO_INTRO_MS,
  GALLERY_HERO_INTRO_MS_TABLET,
  galleryRevealStaggerDelaySecondsTablet,
} from "../constants/gallery-reveal";
import {
  LARGE_DESKTOP_MIN_WIDTH,
  isMobileLayout,
} from "../constants/breakpoints";

function initGalleryScrollReveal(): void {
  const sections = Array.from(
    document.querySelectorAll(".gallery-page .gallery-page__section--reveal"),
  );
  if (!sections.length) return;

  const titleSelector = ".photo-gallery__title, .photo-art__title";
  // Only tablet+ markup — skip `.…__mobile` clones so stagger/observers stay correct.
  const imageSelector = [
    ".photo-gallery__grid .photo-gallery__item",
    ".photo-art__grid .photo-art__item",
    ".art__item",
    ".gallery-content__featured",
    ".gallery-content__grid .gallery-content__item",
    ".gallery-page__footer-heading",
    ".contact-actions__link",
    ".gallery-page__footer-lead",
    ".gallery-page__footer-copy",
  ].join(", ");

  const revealTarget = (target: Element) => {
    target.classList.add("gallery-page__target--visible");
  };

  const markReady = (section: Element) => {
    section.classList.add("gallery-page__section--intro-ready");
  };

  const isLargeDesktop = window.matchMedia(
    `(min-width: ${LARGE_DESKTOP_MIN_WIDTH}px)`,
  ).matches;

  const prepareTarget = (target: Element, index: number | null) => {
    const element = target as HTMLElement;
    target.classList.add("gallery-page__target");
    if (index !== null) {
      element.style.transitionDelay = `${galleryRevealStaggerDelaySecondsTablet(index)}s`;
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

  const heroIntroMs = isLargeDesktop
    ? GALLERY_HERO_INTRO_MS
    : GALLERY_HERO_INTRO_MS_TABLET;

  const heroIntroReady = new Promise<void>((resolve) => {
    window.setTimeout(resolve, heroIntroMs);
  });

  const revealAfterPaint = (targets: Element[]) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          targets.forEach((target) => revealTarget(target));
        }, 80);
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
