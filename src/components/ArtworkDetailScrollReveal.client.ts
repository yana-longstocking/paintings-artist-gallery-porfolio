import { galleryRevealStaggerDelaySeconds } from "../constants/gallery-reveal";
import { isMobileLayout, isTabletLayout } from "../constants/breakpoints";

const INTRO_SELECTOR = [
  ".artwork-detail__main-image",
  ".artwork-detail__title",
  ".artwork-detail__description",
  ".artwork-detail__medium",
  ".artwork-detail__size",
  ".artwork-detail__price",
].join(", ");

const DETAILS_SELECTOR = [
  ".artwork-detail__additional-title",
  ".artwork-detail__gallery-item",
].join(", ");

const FOOTER_TEXT_SELECTOR =
  ".artwork-detail__footer-title, .artwork-detail__footer-text";
const FOOTER_ACTION_SELECTOR =
  ".artwork-detail__footer-link, .artwork-detail__footer-actions";

const MIN_SCROLL_PX = 40;
const AFTER_TEXT_DELAY_MS = 900;

function initArtworkDetailScrollReveal(): void {
  const root = document.querySelector(".artwork-detail");
  if (!root) return;

  const introTargets = Array.from(root.querySelectorAll(INTRO_SELECTOR));
  const detailsTargets = Array.from(root.querySelectorAll(DETAILS_SELECTOR));
  const additionalTitle = root.querySelector(
    ".artwork-detail__additional-title",
  );
  const galleryItems = Array.from(
    root.querySelectorAll(".artwork-detail__gallery-item"),
  );
  const footerTextTargets = Array.from(
    root.querySelectorAll(FOOTER_TEXT_SELECTOR),
  );
  const footerActionTargets = Array.from(
    root.querySelectorAll(FOOTER_ACTION_SELECTOR),
  );
  const footerCopyright = root.querySelector(
    ".artwork-detail__footer-copyright",
  );
  const footerContent = root.querySelector(".artwork-detail__footer-content");
  const footerBottom = root.querySelector(".artwork-detail__footer-bottom");

  const footerTargets = [
    ...footerTextTargets,
    ...footerActionTargets,
    ...(footerCopyright ? [footerCopyright] : []),
  ];

  const allTargets = [...introTargets, ...detailsTargets, ...footerTargets];
  if (!allTargets.length) return;

  const reveal = (target: Element) => {
    target.classList.add("artwork-detail__target--visible");
  };

  const prepare = (target: Element, index: number | null) => {
    target.classList.add("artwork-detail__target");
    if (index !== null) {
      (target as HTMLElement).style.transitionDelay =
        `${galleryRevealStaggerDelaySeconds(index)}s`;
    }
  };

  const revealAll = (targets: Element[]) => {
    targets.forEach((target) => {
      target.classList.add(
        "artwork-detail__target",
        "artwork-detail__target--visible",
      );
    });
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll(allTargets);
    return;
  }

  const skipUpperMotion = isMobileLayout();
  const tabletLayout = isTabletLayout();

  if (skipUpperMotion) {
    revealAll([...introTargets, ...detailsTargets]);
  } else {
    introTargets.forEach((target, index) => prepare(target, index));
    detailsTargets.forEach((target, index) => prepare(target, index));
  }

  footerTextTargets.forEach((target, index) => prepare(target, index));
  footerActionTargets.forEach((target, index) => prepare(target, index));
  if (footerCopyright) prepare(footerCopyright, null);

  const revealed = new Set<Element>();
  let footerTextDone = footerTextTargets.length === 0;
  let footerActionsDone = footerActionTargets.length === 0;
  let copyrightDone = !footerCopyright;
  let detailsStarted = false;
  let detailsTimer: number | null = null;
  let footerActionsTimer: number | null = null;

  const markRevealed = (target: Element) => {
    if (revealed.has(target)) return;
    revealed.add(target);
    reveal(target);
  };

  const observers: IntersectionObserver[] = [];

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    observers.forEach((observer) => observer.disconnect());
    if (detailsTimer !== null) {
      window.clearTimeout(detailsTimer);
      detailsTimer = null;
    }
    if (footerActionsTimer !== null) {
      window.clearTimeout(footerActionsTimer);
      footerActionsTimer = null;
    }
  };

  const maybeCleanup = () => {
    if (!footerTextDone || !footerActionsDone || !copyrightDone) return;
    if (detailsTimer !== null || footerActionsTimer !== null) return;
    if (!skipUpperMotion) {
      const upper = introTargets.length + detailsTargets.length;
      const upperDone = [...introTargets, ...detailsTargets].every((target) =>
        revealed.has(target),
      );
      if (!upperDone && upper > 0) return;
    }
    cleanup();
  };

  const isEntering = (target: Element) => {
    const rect = target.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  const isDetailsInView = (target: Element) => {
    const rect = target.getBoundingClientRect();
    if (tabletLayout) {
      return rect.top < window.innerHeight * 0.7 && rect.bottom > 80;
    }
    return isEntering(target);
  };

  const tryRevealOnScroll = (target: Element) => {
    if (skipUpperMotion || revealed.has(target)) return;
    if (window.scrollY < MIN_SCROLL_PX) return;
    if (!isEntering(target)) return;
    markRevealed(target);
  };

  const tryRevealDetailsOnTablet = () => {
    if (!tabletLayout || detailsStarted || !additionalTitle) return;
    if (window.scrollY < MIN_SCROLL_PX) return;
    if (!isDetailsInView(additionalTitle)) return;

    detailsStarted = true;
    markRevealed(additionalTitle);

    detailsTimer = window.setTimeout(() => {
      detailsTimer = null;
      galleryItems.forEach((target) => markRevealed(target));
      maybeCleanup();
    }, AFTER_TEXT_DELAY_MS);
  };

  const tryRevealFooterText = () => {
    if (footerTextDone || !footerContent) return;
    if (window.scrollY < MIN_SCROLL_PX) return;
    if (!isEntering(footerContent)) return;

    footerTextDone = true;
    footerTextTargets.forEach((target) => markRevealed(target));

    footerActionsTimer = window.setTimeout(() => {
      footerActionsTimer = null;
      footerActionsDone = true;
      footerActionTargets.forEach((target) => markRevealed(target));
      tryRevealCopyright();
      maybeCleanup();
    }, AFTER_TEXT_DELAY_MS);
  };

  const tryRevealCopyright = () => {
    if (copyrightDone || !footerCopyright) return;
    if (!footerTextDone) return;
    if (window.scrollY < MIN_SCROLL_PX) return;
    if (!isEntering(footerCopyright)) return;

    copyrightDone = true;
    markRevealed(footerCopyright);
    maybeCleanup();
  };

  const onScroll = () => {
    if (!skipUpperMotion) {
      if (tabletLayout) {
        tryRevealDetailsOnTablet();
      } else {
        detailsTargets.forEach((target) => tryRevealOnScroll(target));
      }
      introTargets.forEach((target) => tryRevealOnScroll(target));
    }
    tryRevealFooterText();
    tryRevealCopyright();
    maybeCleanup();
  };

  const observe = (
    target: Element | null,
    handler: () => void,
    options?: IntersectionObserverInit,
  ) => {
    if (!target) return;
    const observer = new IntersectionObserver(() => handler(), {
      threshold: 0,
      rootMargin: "0px 0px 12% 0px",
      ...options,
    });
    observer.observe(target);
    observers.push(observer);
  };

  if (!skipUpperMotion) {
    if (tabletLayout && additionalTitle) {
      observe(additionalTitle, tryRevealDetailsOnTablet, {
        threshold: 0.25,
        rootMargin: "0px",
      });
    } else {
      detailsTargets.forEach((target) => {
        observe(target, () => tryRevealOnScroll(target));
      });
    }
  }
  observe(footerContent, tryRevealFooterText);
  observe(footerCopyright ?? footerBottom, tryRevealCopyright);

  window.addEventListener("scroll", onScroll, { passive: true });

  if (!skipUpperMotion) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          const inView = (target: Element) =>
            target.getBoundingClientRect().top < window.innerHeight * 0.92;

          introTargets.forEach((target) => {
            if (inView(target)) markRevealed(target);
          });

          if (!tabletLayout) {
            const detailsInView = detailsTargets.filter(inView);
            if (detailsInView.length) {
              detailsTimer = window.setTimeout(() => {
                detailsTimer = null;
                detailsInView.forEach((target) => markRevealed(target));
                maybeCleanup();
              }, AFTER_TEXT_DELAY_MS);
            }
          }
        }, 48);
      });
    });
  }

  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtworkDetailScrollReveal);
} else {
  initArtworkDetailScrollReveal();
}
