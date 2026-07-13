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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderHomeLogo);
} else {
  initHeaderHomeLogo();
}
