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

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll();
    return;
  }

  if (window.location.hash === "#contact-us") {
    revealAll();
    return;
  }

  let formTitleDone = false;
  let formContentDone = false;
  let contactTitleDone = false;
  let contactContentDone = false;
  let buttonDone = false;
  let buttonTimer: number | null = null;

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
      revealButton();
      cleanup();
    }, 320);
  };

  const tryRevealFormTitle = () => {
    if (formTitleDone) return;

    const rect = formSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.92) return;

    formTitleDone = true;
    revealFormTitle();
    tryRevealButton();
  };

  const tryRevealFormContent = () => {
    if (formContentDone) return;

    const rect = formSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.72) return;

    formContentDone = true;
    revealFormContent();
    tryRevealButton();
  };

  const tryRevealContactTitle = () => {
    if (contactTitleDone) return;

    const rect = contactSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.92) return;

    contactTitleDone = true;
    revealContactTitle();
    tryRevealButton();
  };

  const tryRevealContactContent = () => {
    if (contactContentDone) return;

    const rect = contactSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.72) return;

    contactContentDone = true;
    revealContactContent();
    tryRevealButton();
  };

  const onScroll = () => {
    tryRevealFormTitle();
    tryRevealFormContent();
    tryRevealContactTitle();
    tryRevealContactContent();
    tryRevealButton();
  };

  const formTitleObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) tryRevealFormTitle();
    },
    { threshold: 0.08 },
  );
  const formContentObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) tryRevealFormContent();
    },
    { threshold: 0.08 },
  );
  const contactTitleObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting))
        tryRevealContactTitle();
    },
    { threshold: 0.08 },
  );
  const contactContentObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        tryRevealContactContent();
      }
    },
    { threshold: 0.08 },
  );

  formTitleObserver.observe(formSection);
  formContentObserver.observe(formSection);
  contactTitleObserver.observe(contactSection);
  contactContentObserver.observe(contactSection);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterScrollReveal);
} else {
  initFooterScrollReveal();
}
