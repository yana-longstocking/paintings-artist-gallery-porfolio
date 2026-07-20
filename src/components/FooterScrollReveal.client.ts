import { isMobileLayout, isTabletLayout } from "../constants/breakpoints";
import { getScrollY } from "../utils/scrollRoot";

const MIN_SCROLL_PX = 40;
const CONTENT_DELAY_MS = 240;
const BUTTON_DELAY_MS = 520;

function initFooterScrollReveal(): void {
  const footer = document.querySelector(".footer--scroll-reveal");
  if (!footer) return;

  const formSection = footer.querySelector(".footer__form-section");
  const contactSection = footer.querySelector(".footer__contact-section");
  if (!formSection || !contactSection) return;

  const heading = footer.querySelector(".footer__heading");
  const copyright = footer.querySelector(".footer__copyright-text");

  const revealFormContent = () =>
    formSection.classList.add("footer__form-section--content-visible");
  const revealContactContent = () =>
    contactSection.classList.add("footer__contact-section--content-visible");
  const revealHeading = () => footer.classList.add("footer--heading-visible");
  const revealButton = () => footer.classList.add("footer--button-visible");
  const revealCopyright = () =>
    footer.classList.add("footer--copyright-visible");
  const revealAll = () => {
    revealHeading();
    revealFormContent();
    revealContactContent();
    revealButton();
    revealCopyright();
  };

  if (isMobileLayout()) {
    revealAll();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll();
    return;
  }

  // Start only when the block is clearly on screen, so the slide-up is visible.
  const enterRatio = isTabletLayout() ? 0.72 : 0.78;

  let sequenceStarted = false;
  let copyrightDone = !copyright;
  let contentTimer: number | null = null;
  let buttonTimer: number | null = null;
  const observers: IntersectionObserver[] = [];

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    observers.forEach((observer) => observer.disconnect());
    if (contentTimer !== null) {
      window.clearTimeout(contentTimer);
      contentTimer = null;
    }
    if (buttonTimer !== null) {
      window.clearTimeout(buttonTimer);
      buttonTimer = null;
    }
  };

  const maybeCleanup = () => {
    if (!sequenceStarted || !copyrightDone) return;
    if (contentTimer !== null || buttonTimer !== null) return;
    cleanup();
  };

  const isEntering = (target: Element, ratio = enterRatio) => {
    const rect = target.getBoundingClientRect();
    return rect.top < window.innerHeight * ratio && rect.bottom > 0;
  };

  const startSequence = () => {
    if (sequenceStarted) return;
    sequenceStarted = true;

    // Double rAF so opacity/transform transitions always run.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        revealHeading();

        contentTimer = window.setTimeout(() => {
          contentTimer = null;
          revealFormContent();
          revealContactContent();
          maybeCleanup();
        }, CONTENT_DELAY_MS);

        buttonTimer = window.setTimeout(() => {
          buttonTimer = null;
          revealButton();
          maybeCleanup();
        }, BUTTON_DELAY_MS);

        tryRevealCopyright();
      });
    });
  };

  const tryStartSequence = () => {
    if (sequenceStarted) return;
    if (getScrollY() < MIN_SCROLL_PX) return;

    const trigger = heading ?? formSection;
    if (!isEntering(trigger)) return;

    startSequence();
  };

  const tryRevealCopyright = () => {
    if (copyrightDone || !copyright) return;
    if (!sequenceStarted) return;
    if (getScrollY() < MIN_SCROLL_PX) return;
    if (!isEntering(copyright, 1)) return;

    copyrightDone = true;
    revealCopyright();
    maybeCleanup();
  };

  const onScroll = () => {
    tryStartSequence();
    tryRevealCopyright();
  };

  const observe = (target: Element | null, handler: () => void) => {
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        handler();
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -12% 0px",
      },
    );
    observer.observe(target);
    observers.push(observer);
  };

  observe(heading ?? footer, tryStartSequence);
  observe(formSection, tryStartSequence);
  observe(copyright, tryRevealCopyright);

  window.addEventListener("scroll", onScroll, { passive: true });

  if (window.location.hash === "#contact-us") {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        startSequence();
        copyrightDone = true;
        revealCopyright();
        maybeCleanup();
      });
    });
    return;
  }

  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterScrollReveal);
} else {
  initFooterScrollReveal();
}
