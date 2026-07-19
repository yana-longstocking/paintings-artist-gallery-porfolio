import { getScrollX, getScrollY, scrollTo } from "../utils/scrollRoot";

const MENU_HASH = "menu-toggle";

function restoreScrollPosition(scrollX: number, scrollY: number): void {
  const jump = () => {
    scrollTo({ left: scrollX, top: scrollY, behavior: "auto" });
  };

  jump();
  requestAnimationFrame(jump);
}

function initHeaderMenuHash(): void {
  const burger = document.querySelector(".header__burger");
  const closeBtn = document.querySelector(".header__close-btn");

  burger?.addEventListener("click", (event) => {
    if (!(event.currentTarget instanceof HTMLAnchorElement)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    event.preventDefault();
    const scrollX = getScrollX();
    const scrollY = getScrollY();
    window.location.hash = MENU_HASH;
    restoreScrollPosition(scrollX, scrollY);
  });

  closeBtn?.addEventListener("click", (event) => {
    if (!(event.currentTarget instanceof HTMLAnchorElement)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    event.preventDefault();
    const scrollX = getScrollX();
    const scrollY = getScrollY();
    const { pathname, search } = window.location;
    // Clear hash for :target without relying on href="#", which scrolls to top.
    window.location.hash = "";
    history.replaceState(null, "", `${pathname}${search}`);
    restoreScrollPosition(scrollX, scrollY);
  });
}

function initHeaderHomeLogo(): void {
  document
    .querySelector("[data-home-logo]")
    ?.addEventListener("click", (event) => {
      const link = event.currentTarget;
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.dataset.isHome !== "true") return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      event.preventDefault();
      window.location.reload();
    });
}

function initHeader(): void {
  initHeaderHomeLogo();
  initHeaderMenuHash();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeader);
} else {
  initHeader();
}
