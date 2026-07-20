import { isMobileLayout } from "../constants/breakpoints";
import { getScrollY } from "../utils/scrollRoot";

function initArtistBioReveal(): void {
  const bio = document.querySelector(".artist-bio--reveal");
  if (!bio) return;

  const wrapper = bio.querySelector(".artist-bio__wrapper");
  const text = bio.querySelector(".artist-bio__text");
  if (!wrapper || !text) return;

  const revealTitle = () => bio.classList.add("artist-bio--visible");
  const revealContent = () => bio.classList.add("artist-bio--content-visible");
  const revealText = () => bio.classList.add("artist-bio--text-visible");
  const revealAll = () => {
    revealTitle();
    revealContent();
    revealText();
  };

  if (isMobileLayout()) {
    revealAll();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll();
    return;
  }

  if (window.location.hash === "#artist-bio") {
    revealAll();
    return;
  }

  const minScroll = 40;
  let titleDone = false;
  let contentDone = false;
  let textDone = false;
  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    titleObserver.disconnect();
    contentObserver.disconnect();
    textObserver.disconnect();
  };

  const tryRevealTitle = () => {
    if (titleDone) return;
    if (getScrollY() < minScroll) return;

    const rect = bio.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.88) return;

    titleDone = true;
    revealTitle();
    if (contentDone && textDone) cleanup();
  };

  const tryRevealContent = () => {
    if (contentDone) return;
    if (getScrollY() < minScroll) return;

    const rect = wrapper.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.78) return;

    contentDone = true;
    revealContent();
    if (titleDone && textDone) cleanup();
  };

  const tryRevealText = () => {
    if (textDone) return;
    if (getScrollY() < minScroll) return;

    const rect = text.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.9) return;

    textDone = true;
    revealText();
    if (titleDone && contentDone) cleanup();
  };

  const onScroll = () => {
    tryRevealTitle();
    tryRevealContent();
    tryRevealText();
  };

  const titleObserver = new IntersectionObserver(() => tryRevealTitle(), {
    threshold: 0,
  });
  const contentObserver = new IntersectionObserver(() => tryRevealContent(), {
    threshold: 0,
  });
  const textObserver = new IntersectionObserver(() => tryRevealText(), {
    threshold: 0,
  });

  titleObserver.observe(bio);
  contentObserver.observe(wrapper);
  textObserver.observe(text);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtistBioReveal);
} else {
  initArtistBioReveal();
}
