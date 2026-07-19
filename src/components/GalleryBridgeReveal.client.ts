import { DESKTOP_MIN_WIDTH, isMobileLayout } from "../constants/breakpoints";
import { getScrollRoot, getScrollY } from "../utils/scrollRoot";

const MIN_SCROLL_PX = 24;

function initGalleryBridgeReveal(): void {
  const bridge = document.querySelector(".gallery-bridge--reveal");
  if (!bridge) return;

  const reveal = () => {
    bridge.classList.add("gallery-bridge--visible");
  };

  if (window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches) {
    return;
  }

  if (isMobileLayout()) {
    reveal();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveal();
    return;
  }

  let revealed = false;
  const scroller = getScrollRoot();

  const revealAfterPaint = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        reveal();
      });
    });
  };

  const tryReveal = () => {
    if (revealed) return;
    if (getScrollY() < MIN_SCROLL_PX) return;

    const rect = bridge.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.82) return;

    revealed = true;
    revealAfterPaint();
    observer.disconnect();
    scroller.removeEventListener("scroll", tryReveal);
  };

  const observer = new IntersectionObserver(() => tryReveal(), {
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px",
  });

  observer.observe(bridge);
  scroller.addEventListener("scroll", tryReveal, { passive: true });
  tryReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryBridgeReveal);
} else {
  initGalleryBridgeReveal();
}
