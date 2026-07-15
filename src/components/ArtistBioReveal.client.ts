import { isMobileLayout } from "../constants/breakpoints";

function initArtistBioReveal(): void {
  const bio = document.querySelector(".artist-bio--reveal");
  if (!bio) return;

  const wrapper = bio.querySelector(".artist-bio__wrapper");
  if (!wrapper) return;

  const revealTitle = () => bio.classList.add("artist-bio--visible");
  const revealContent = () => bio.classList.add("artist-bio--content-visible");
  const revealAll = () => {
    revealTitle();
    revealContent();
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

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    titleObserver.disconnect();
    contentObserver.disconnect();
  };

  const tryRevealTitle = () => {
    if (titleDone) return;
    if (window.scrollY < minScroll) return;

    const rect = bio.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.88) return;

    titleDone = true;
    revealTitle();
    if (contentDone) cleanup();
  };

  const tryRevealContent = () => {
    if (contentDone) return;
    if (window.scrollY < minScroll) return;

    const rect = wrapper.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.58) return;

    contentDone = true;
    revealContent();
    if (titleDone) cleanup();
  };

  const onScroll = () => {
    tryRevealTitle();
    tryRevealContent();
  };

  const titleObserver = new IntersectionObserver(() => tryRevealTitle(), {
    threshold: 0,
  });
  const contentObserver = new IntersectionObserver(() => tryRevealContent(), {
    threshold: 0,
  });

  titleObserver.observe(bio);
  contentObserver.observe(wrapper);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtistBioReveal);
} else {
  initArtistBioReveal();
}
