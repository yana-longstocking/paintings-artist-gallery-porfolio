import { isMobileLayout } from "../constants/breakpoints";

function initFooterScrollReveal(): void {
  const footer = document.querySelector(".footer--scroll-reveal");
  if (!footer) return;

  const formSection = footer.querySelector(".footer__form-section");
  const contactSection = footer.querySelector(".footer__contact-section");
  if (!formSection || !contactSection) return;

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

  if (window.location.hash === "#contact-us") {
    revealAll();
    return;
  }

  const minScroll = 40;
  let headingDone = false;
  let formContentDone = false;
  let contactContentDone = false;
  let buttonDone = false;
  let copyrightDone = false;
  let buttonTimer: number | null = null;

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    headingObserver.disconnect();
    formContentObserver.disconnect();
    contactContentObserver.disconnect();
    copyrightObserver.disconnect();
  };

  const tryRevealButton = () => {
    if (buttonDone || !formContentDone) return;

    const button = footer.querySelector(".footer__button");
    if (!button) return;

    const rect = button.getBoundingClientRect();
    if (rect.top >= window.innerHeight * 0.98) return;

    buttonDone = true;
    buttonTimer = window.setTimeout(() => {
      buttonTimer = null;
      revealButton();
      if (copyrightDone) cleanup();
    }, 180);
  };

  const tryRevealCopyright = () => {
    if (copyrightDone) return;
    if (window.scrollY < minScroll) return;

    const copyright = footer.querySelector(".footer__copyright-text");
    if (!copyright) return;

    const rect = copyright.getBoundingClientRect();
    if (rect.top >= window.innerHeight) return;

    copyrightDone = true;
    revealCopyright();
    if (buttonDone && !buttonTimer) cleanup();
  };

  const tryRevealHeading = () => {
    if (headingDone) return;
    if (window.scrollY < minScroll) return;

    const heading = footer.querySelector(".footer__heading");
    const target = heading ?? formSection;
    const rect = target.getBoundingClientRect();
    if (rect.top >= window.innerHeight) return;

    headingDone = true;
    revealHeading();
  };

  const tryRevealFormContent = () => {
    if (formContentDone) return;
    if (window.scrollY < minScroll) return;

    const rect = formSection.getBoundingClientRect();
    if (rect.top >= window.innerHeight * 0.9) return;

    formContentDone = true;
    revealFormContent();
    tryRevealButton();
  };

  const tryRevealContactContent = () => {
    if (contactContentDone) return;
    if (window.scrollY < minScroll) return;

    const rect = contactSection.getBoundingClientRect();
    if (rect.top >= window.innerHeight * 0.9) return;

    contactContentDone = true;
    revealContactContent();
    tryRevealButton();
  };

  const onScroll = () => {
    tryRevealHeading();
    tryRevealFormContent();
    tryRevealContactContent();
    tryRevealButton();
    tryRevealCopyright();
  };

  const observerOptions: IntersectionObserverInit = {
    threshold: 0,
  };

  const headingEl = footer.querySelector(".footer__heading");
  const headingObserver = new IntersectionObserver(
    () => tryRevealHeading(),
    observerOptions,
  );
  const formContentObserver = new IntersectionObserver(
    () => tryRevealFormContent(),
    observerOptions,
  );
  const contactContentObserver = new IntersectionObserver(
    () => tryRevealContactContent(),
    observerOptions,
  );
  const copyrightEl = footer.querySelector(".footer__copyright-text");
  const copyrightObserver = new IntersectionObserver(
    () => tryRevealCopyright(),
    observerOptions,
  );

  if (headingEl) headingObserver.observe(headingEl);
  formContentObserver.observe(formSection);
  contactContentObserver.observe(contactSection);
  if (copyrightEl) copyrightObserver.observe(copyrightEl);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterScrollReveal);
} else {
  initFooterScrollReveal();
}
