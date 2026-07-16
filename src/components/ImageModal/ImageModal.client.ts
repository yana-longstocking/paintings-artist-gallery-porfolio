import { initializeImageModal, type ImageData } from "./ImageModal.ts";

declare global {
  interface Window {
    __imageModalData?: ImageData;
  }
}

function initModal() {
  const modalElement = document.getElementById("imageModal");
  const baseUrl = import.meta.env.BASE_URL;
  const imageData = window.__imageModalData;

  if (modalElement && baseUrl && imageData) {
    initializeImageModal(baseUrl, imageData);
  } else {
    requestAnimationFrame(initModal);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initModal);
} else {
  requestAnimationFrame(initModal);
}
