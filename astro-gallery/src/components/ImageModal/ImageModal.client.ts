import { initializeImageModal, type ImageData } from "./ImageModal.ts";

// Get values from window object (set by define:vars script)
declare global {
  interface Window {
    __imageModalData?: ImageData;
  }
}

// Initialize the modal controller
function initModal() {
  const modalElement = document.getElementById("imageModal");
  const baseUrl = import.meta.env.BASE_URL;
  const imageData = window.__imageModalData;
  
  if (modalElement && baseUrl && imageData) {
    initializeImageModal(baseUrl, imageData);
  } else {
    // If not ready, retry
    requestAnimationFrame(initModal);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModal);
} else {
  // DOM already loaded, use requestAnimationFrame to ensure it's ready
  requestAnimationFrame(initModal);
}

