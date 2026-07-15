import { isMobileLayout } from "../constants/breakpoints";

function initFooterScrollReveal(): void {
  const footer = document.querySelector(".footer--scroll-reveal");
  if (!footer) return;

  const formSection = footer.querySelector(".footer__form-section");
  const contactSection = footer.querySelector(".footer__contact-section");
  if (!formSection || !contactSection) return;

  const revealFormTitle = () =>
    formSection.classList.add("footer__form-section--visible");
  const revealFormContent = () =>
    formSection.classList.add("footer__form-section--content-visible");
  const revealContactTitle = () =>
    contactSection.classList.add("footer__contact-section--visible");
  const revealContactContent = () =>
    contactSection.classList.add("footer__contact-section--content-visible");
  const revealButton = () => footer.classList.add("footer--button-visible");
  const revealAll = () => {
    revealFormTitle();
    revealFormContent();
    revealContactTitle();
    revealContactContent();
    revealButton();
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
  let formTitleDone = false;
  let formContentDone = false;
  let contactTitleDone = false;
  let contactContentDone = false;
  let buttonDone = false;
  let buttonTimer: number | null = null;

  const revealAfterPaint = (callback: () => void) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(callback, 48);
      });
    });
  };

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    formTitleObserver.disconnect();
    formContentObserver.disconnect();
    contactTitleObserver.disconnect();
    contactContentObserver.disconnect();
    if (buttonTimer) window.clearTimeout(buttonTimer);
  };

  const footerContentDone = () =>
    formTitleDone && formContentDone && contactTitleDone && contactContentDone;

  const tryRevealButton = () => {
    if (buttonDone || !footerContentDone()) return;

    const rect = footer.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.55) return;

    buttonDone = true;
    buttonTimer = window.setTimeout(() => {
      revealAfterPaint(revealButton);
      cleanup();
    }, 320);
  };

  const tryRevealFormTitle = () => {
    if (formTitleDone) return;
    if (window.scrollY < minScroll) return;

    const rect = formSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.98) return;

    formTitleDone = true;
    revealAfterPaint(revealFormTitle);
    tryRevealButton();
  };

  const tryRevealFormContent = () => {
    if (formContentDone) return;
    if (window.scrollY < minScroll) return;

    const rect = formSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.82) return;

    formContentDone = true;
    revealAfterPaint(revealFormContent);
    tryRevealButton();
  };

  const tryRevealContactTitle = () => {
    if (contactTitleDone) return;
    if (window.scrollY < minScroll) return;

    const rect = contactSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.98) return;

    contactTitleDone = true;
    revealAfterPaint(revealContactTitle);
    tryRevealButton();
  };

  const tryRevealContactContent = () => {
    if (contactContentDone) return;
    if (window.scrollY < minScroll) return;

    const rect = contactSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.82) return;

    contactContentDone = true;
    revealAfterPaint(revealContactContent);
    tryRevealButton();
  };

  const onScroll = () => {
    tryRevealFormTitle();
    tryRevealFormContent();
    tryRevealContactTitle();
    tryRevealContactContent();
    tryRevealButton();
  };

  const observerOptions: IntersectionObserverInit = {
    threshold: 0,
    rootMargin: "0px 0px 10% 0px",
  };

  const formTitleObserver = new IntersectionObserver(
    () => tryRevealFormTitle(),
    observerOptions,
  );
  const formContentObserver = new IntersectionObserver(
    () => tryRevealFormContent(),
    observerOptions,
  );
  const contactTitleObserver = new IntersectionObserver(
    () => tryRevealContactTitle(),
    observerOptions,
  );
  const contactContentObserver = new IntersectionObserver(
    () => tryRevealContactContent(),
    observerOptions,
  );

  formTitleObserver.observe(formSection);
  formContentObserver.observe(formSection);
  contactTitleObserver.observe(contactSection);
  contactContentObserver.observe(contactSection);
  void (footer as HTMLElement).offsetWidth;
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterScrollReveal);
} else {
  initFooterScrollReveal();
}
