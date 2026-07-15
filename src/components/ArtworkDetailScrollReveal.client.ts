import { galleryRevealStaggerDelaySeconds } from "../constants/gallery-reveal";
import { isMobileLayout } from "../constants/breakpoints";

const HERO_SELECTOR = [
  ".artwork-detail__main-image",
  ".artwork-detail__title",
  ".artwork-detail__description",
  ".artwork-detail__medium",
  ".artwork-detail__size",
  ".artwork-detail__price",
  ".artwork-detail__additional-title",
  ".artwork-detail__gallery-item",
].join(", ");

const FOOTER_SELECTOR = [
  ".artwork-detail__footer-title",
  ".artwork-detail__footer-text",
  ".artwork-detail__footer-link",
  ".artwork-detail__footer-actions",
  ".artwork-detail__footer-copyright",
].join(", ");

function initArtworkDetailScrollReveal(): void {
  const root = document.querySelector(".artwork-detail");
  if (!root) return;

  const heroTargets = Array.from(root.querySelectorAll(HERO_SELECTOR));
  const footerTargets = Array.from(root.querySelectorAll(FOOTER_SELECTOR));
  const targets = [...heroTargets, ...footerTargets];
  if (!targets.length) return;

  const revealTarget = (target: Element) => {
    target.classList.add("artwork-detail__target--visible");
  };

  const prepareTarget = (target: Element, index: number | null) => {
    const element = target as HTMLElement;
    target.classList.add("artwork-detail__target");
    if (index !== null) {
      element.style.transitionDelay = `${galleryRevealStaggerDelaySeconds(index)}s`;
    }
  };

  if (isMobileLayout()) {
    targets.forEach((target) => {
      target.classList.add(
        "artwork-detail__target",
        "artwork-detail__target--visible",
      );
    });
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((target) => {
      target.classList.add(
        "artwork-detail__target",
        "artwork-detail__target--visible",
      );
    });
    return;
  }

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
      // Positive bottom margin so last footer lines still trigger near page end.
      { threshold: 0, rootMargin: "0px 0px 12% 0px" },
    );

    observer.observe(target);

    if (isNearViewport(target)) {
      tryReveal();
    }
  };

  const immediate: Element[] = [];

  heroTargets.forEach((target, index) => {
    prepareTarget(target, index);
    if (isNearViewport(target)) {
      immediate.push(target);
    } else {
      observeTarget(target);
    }
  });

  footerTargets.forEach((target, index) => {
    prepareTarget(target, index);
    if (isNearViewport(target)) {
      immediate.push(target);
    } else {
      observeTarget(target);
    }
  });

  // Paint hidden state first so the opener fly-in always runs.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        immediate.forEach((target) => revealTarget(target));
      }, 48);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtworkDetailScrollReveal);
} else {
  initArtworkDetailScrollReveal();
}
