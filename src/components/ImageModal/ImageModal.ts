/**
 * CSS classes for slide animations
 */
export const ANIMATION_CLASSES = {
  OUT_LEFT: "modal__content--out-left",
  OUT_RIGHT: "modal__content--out-right",
  IN_LEFT: "modal__content--in-left",
  IN_RIGHT: "modal__content--in-right",
} as const;

/**
 * Key codes for keyboard navigation
 */
export const KEY_CODES = {
  ESCAPE: "Escape",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
} as const;

/**
 * Zoom configuration constants
 */
const ZOOM_CONFIG = {
  MIN: 1,
  MAX: 2.5,
  DEFAULT: 1,
} as const;

/**
 * Pan/scroll configuration
 */
const PAN_CONFIG = {
  SCROLL_SPEED: 1.5,
} as const;

/**
 * Swipe detection configuration
 */
const SWIPE_CONFIG = {
  MIN_DISTANCE: 50,
  MAX_DURATION: 500,
} as const;

/**
 * DOM element IDs used in the modal
 */
const DOM_IDS = {
  MODAL: "imageModal",
  MODAL_IMAGE: "modalImage",
  MODAL_CAPTION: "modalCaption",
  MODAL_CLOSE: "modalClose",
  MODAL_ARROW_LEFT: "modalArrowLeft",
  MODAL_ARROW_RIGHT: "modalArrowRight",
  MODAL_ZOOM: "modalZoom",
  MODAL_ZOOM_ICON: "modalZoomIcon",
} as const;

/**
 * CSS custom property names for transforms
 */
const CSS_VARS = {
  ZOOM: "--modal-zoom",
  PAN_X: "--modal-pan-x",
  PAN_Y: "--modal-pan-y",
} as const;

/**
 * Icon paths for zoom states
 */
const ZOOM_ICONS = {
  IN: "icons/zoom-in.svg",
  OUT: "icons/zoom-out.svg",
  SQUARE_IN: "icons/zoom-in-square.svg",
  SQUARE_OUT: "icons/zoom-out-square.svg",
} as const;

const TABLET_MIN_WIDTH = 744;
/**
 * Represents an image in the carousel
 */
export interface CarouselImage {
  src: string;
  srcOriginal: string;
  alt: string;
}

/**
 * Additional photo objects in the gallery
 */
export interface AdditionalPhoto {
  id?: string;
  src: string;
  srcOriginal?: string;
  alt: string;
}

/**
 * Main image data structure
 */
export interface ImageData {
  id?: string;
  src: string;
  srcOriginal?: string;
  alt: string;
  description?: string;
  medium?: string;
  size?: string;
  price?: string;
  featured?: boolean;
  additionalPhotos?: AdditionalPhoto[];
}

/**
 * Drag state for panning
 */
interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  hasMoved: boolean;
}

/**
 * Pan bounds for constraining movement
 */
interface PanBounds {
  maxX: number;
  maxY: number;
}

/**
 * Direction for image navigation
 */
type NavigationDirection = -1 | 1;

export class ImageModalController {
  // Dependencies
  private readonly baseUrl: string;
  private readonly imageData: ImageData;
  private readonly cursorZoomInValue: string;
  private readonly cursorZoomOutValue: string;

  // Carousel state
  private currentImageIndex: number = 0;
  private allImages: CarouselImage[] = [];
  private isAnimating: boolean = false;
  private readonly imagePreloadCache: Set<string> = new Set();

  // Zoom state
  private zoomScale: number = ZOOM_CONFIG.DEFAULT;

  // Pan state
  private panX: number = 0;
  private panY: number = 0;
  private dragState: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    hasMoved: false,
  };

  // Track mouse state to distinguish click from drag
  private mouseDownX: number = 0;
  private mouseDownY: number = 0;
  private isMouseDown: boolean = false;
  private canToggleZoomOnClick: boolean = false;

  // Track touch state for one-finger scrolling
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private touchLastX: number = 0;
  private touchLastY: number = 0;
  private isTouchActive: boolean = false;

  // DOM element references
  private modalElement: HTMLElement | null = null;
  private modalImageElement: HTMLImageElement | null = null;
  private modalCaptionElement: HTMLElement | null = null;
  private modalArrowLeftElement: HTMLElement | null = null;
  private modalArrowRightElement: HTMLElement | null = null;

  constructor(baseUrl: string, imageData: ImageData) {
    this.baseUrl = baseUrl;
    this.imageData = imageData;
    this.cursorZoomInValue = this.buildCursorValue(
      ZOOM_ICONS.SQUARE_IN,
      "zoom-in",
    );
    this.cursorZoomOutValue = this.buildCursorValue(
      ZOOM_ICONS.SQUARE_OUT,
      "zoom-out",
    );

    // Preload cursor icons to prevent delay when applying cursor styles
    this.preloadCursorIcons();

    this.initializeElements();
    this.attachEventListeners();
  }

  openModal(img: HTMLImageElement): void {
    if (!this.ensureElementsReady()) {
      return;
    }

    this.collectAllImages();
    this.preloadCarouselImages();

    if (this.allImages.length === 0) {
      return;
    }

    // Find and set the clicked image as current
    const clickedSrc = img.dataset.srcOriginal || img.src;
    const foundIndex = this.findImageIndex(clickedSrc);
    this.currentImageIndex = Math.max(0, foundIndex);

    // Display the modal
    this.showCurrentImage();
    this.showModal();
    this.resetZoom();
  }

  changeImage(direction: NavigationDirection): void {
    if (
      this.allImages.length <= 1 ||
      this.isAnimating ||
      !this.modalImageElement
    ) {
      return;
    }

    this.isAnimating = true;

    const { outClass, inClass } = this.getAnimationClasses(direction);
    this.startSlideOutAnimation(outClass, inClass, direction);
  }

  /**
   * Closes the modal and restores page scroll
   */
  closeModal(): void {
    if (!this.modalElement) {
      return;
    }

    this.hideModal();
    this.enableBodyScroll();
  }

  /**
   * Initializes DOM element references
   */
  private initializeElements(): void {
    this.modalElement = document.getElementById(DOM_IDS.MODAL);
    this.modalImageElement = document.getElementById(
      DOM_IDS.MODAL_IMAGE,
    ) as HTMLImageElement | null;
    this.modalCaptionElement = document.getElementById(DOM_IDS.MODAL_CAPTION);
    this.modalArrowLeftElement = document.getElementById(
      DOM_IDS.MODAL_ARROW_LEFT,
    );
    this.modalArrowRightElement = document.getElementById(
      DOM_IDS.MODAL_ARROW_RIGHT,
    );
  }

  private ensureElementsReady(): boolean {
    return !!(
      this.modalElement &&
      this.modalImageElement &&
      this.modalCaptionElement
    );
  }

  /**
   * Collects all images from imageData into a carousel array
   */
  private collectAllImages(): void {
    this.allImages = [];

    // Add main image
    const mainImage: CarouselImage = {
      src: this.buildImageUrl(this.imageData.src),
      srcOriginal: this.buildImageUrl(
        this.imageData.srcOriginal || this.imageData.src,
      ),
      alt: this.imageData.alt,
    };
    this.allImages.push(mainImage);

    // Add additional photos if they exist
    if (this.imageData.additionalPhotos?.length) {
      this.imageData.additionalPhotos.forEach((photo) => {
        this.allImages.push({
          src: this.buildImageUrl(photo.src),
          srcOriginal: this.buildImageUrl(photo.srcOriginal || photo.src),
          alt: photo.alt,
        });
      });
    }
  }

  private buildImageUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private buildCursorValue(path: string, fallback: string): string {
    const url = this.buildImageUrl(path);
    // SVG cursors require an explicit hotspot coordinate; use center of 34x34 icon
    return `url("${url}") 17 17, ${fallback}`;
  }

  /**
   * Preloads cursor icons to prevent delay when applying cursor styles
   */
  private preloadCursorIcons(): void {
    const iconsToPreload = [ZOOM_ICONS.SQUARE_IN, ZOOM_ICONS.SQUARE_OUT];

    iconsToPreload.forEach((iconPath) => {
      const img = new Image();
      img.src = this.buildImageUrl(iconPath);
    });
  }

  private findImageIndex(clickedSrc: string): number {
    return this.allImages.findIndex(
      (image) => image.src === clickedSrc || image.srcOriginal === clickedSrc,
    );
  }

  /**
   * Displays the current image in the modal
   */
  private showCurrentImage(): void {
    if (!this.ensureElementsReady() || this.allImages.length === 0) {
      return;
    }

    const currentImage = this.allImages[this.currentImageIndex];

    if (this.modalImageElement) {
      this.modalImageElement.src = currentImage.srcOriginal;
    }

    if (this.modalCaptionElement) {
      this.modalCaptionElement.textContent = currentImage.alt;
    }
  }

  /**
   * Preloads all images in the current carousel to ensure instant swaps
   */
  private preloadCarouselImages(): void {
    if (!this.allImages.length) {
      return;
    }

    this.allImages.forEach((image) => {
      this.preloadImageAsset(image.srcOriginal);
    });
  }

  private preloadImageAsset(src: string): void {
    if (!src || this.imagePreloadCache.has(src)) {
      return;
    }

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    this.imagePreloadCache.add(src);
  }

  private getAnimationClasses(direction: NavigationDirection) {
    return {
      outClass:
        direction > 0
          ? ANIMATION_CLASSES.OUT_LEFT
          : ANIMATION_CLASSES.OUT_RIGHT,
      inClass:
        direction > 0 ? ANIMATION_CLASSES.IN_RIGHT : ANIMATION_CLASSES.IN_LEFT,
    };
  }

  private startSlideOutAnimation(
    outClass: string,
    inClass: string,
    direction: NavigationDirection,
  ): void {
    if (!this.modalImageElement) {
      return;
    }

    // Remove all animation classes
    this.clearAnimationClasses();

    // Start slide-out animation
    this.modalImageElement.classList.add(outClass);

    // Handle animation end
    const onSlideOutEnd = () => {
      if (!this.modalImageElement) {
        return;
      }

      this.modalImageElement.removeEventListener("animationend", onSlideOutEnd);

      // Update to next/previous image
      this.updateImageIndex(direction);
      this.showCurrentImage();

      // Start slide-in animation
      this.modalImageElement.classList.remove(outClass);
      this.modalImageElement.classList.add(inClass);

      const onSlideInEnd = () => {
        if (!this.modalImageElement) {
          return;
        }

        this.modalImageElement.removeEventListener(
          "animationend",
          onSlideInEnd,
        );
        this.modalImageElement.classList.remove(inClass);
        this.isAnimating = false;
      };

      this.modalImageElement.addEventListener("animationend", onSlideInEnd);
    };

    this.modalImageElement.addEventListener("animationend", onSlideOutEnd);
  }

  /**
   * Removes all animation classes from the modal image
   */
  private clearAnimationClasses(): void {
    if (!this.modalImageElement) {
      return;
    }

    Object.values(ANIMATION_CLASSES).forEach((className) => {
      this.modalImageElement!.classList.remove(className);
    });
  }

  private updateImageIndex(direction: NavigationDirection): void {
    this.currentImageIndex += direction;

    if (this.currentImageIndex >= this.allImages.length) {
      this.currentImageIndex = 0;
    } else if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.allImages.length - 1;
    }
  }

  /**
   * Shows the modal and prevents body scroll
   */
  private showModal(): void {
    if (!this.modalElement) {
      return;
    }

    this.modalElement.style.display = "block";
    this.disableBodyScroll();
  }

  /**
   * Hides the modal
   */
  private hideModal(): void {
    if (!this.modalElement) {
      return;
    }

    this.modalElement.style.display = "none";
  }

  /**
   * Disables body scroll when modal is open
   */
  private disableBodyScroll(): void {
    document.body.style.overflow = "hidden";
  }

  /**
   * Enables body scroll when modal is closed
   */
  private enableBodyScroll(): void {
    document.body.style.overflow = "auto";
  }

  /**
   * Resets zoom and pan to default values
   */
  private resetZoom(): void {
    this.zoomScale = ZOOM_CONFIG.DEFAULT;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
    this.updateZoomIcon();
    this.updateCursor();
    this.updateUIElementsVisibility();
  }

  /**
   * Toggles between zoom in and zoom out
   */
  private toggleZoom(): void {
    if (this.zoomScale <= ZOOM_CONFIG.MIN) {
      // Zoom in
      this.zoomScale = ZOOM_CONFIG.MAX;
    } else {
      // Zoom out
      this.zoomScale = ZOOM_CONFIG.MIN;
    }

    // Reset pan when changing zoom level
    this.panX = 0;
    this.panY = 0;

    // Constrain pan if zoomed in
    if (this.isZoomedIn()) {
      this.constrainPan();
    }

    this.applyTransform();
    this.updateZoomIcon();
    this.updateCursor();
    this.updateUIElementsVisibility();
  }

  private isZoomedIn(): boolean {
    return this.zoomScale > ZOOM_CONFIG.MIN;
  }

  /**
   * Applies zoom and pan transforms to the modal image
   */
  private applyTransform(): void {
    if (!this.modalImageElement) {
      return;
    }

    this.modalImageElement.style.setProperty(
      CSS_VARS.ZOOM,
      String(this.zoomScale),
    );
    this.modalImageElement.style.setProperty(CSS_VARS.PAN_X, `${this.panX}px`);
    this.modalImageElement.style.setProperty(CSS_VARS.PAN_Y, `${this.panY}px`);
  }

  /**
   * Updates the zoom icon based on current zoom state
   */
  private updateZoomIcon(): void {
    const icon = document.getElementById(
      DOM_IDS.MODAL_ZOOM_ICON,
    ) as HTMLImageElement | null;

    if (!icon) {
      return;
    }

    const iconPath = this.isZoomedIn()
      ? this.buildImageUrl(ZOOM_ICONS.OUT)
      : this.buildImageUrl(ZOOM_ICONS.IN);

    icon.setAttribute("src", iconPath);
  }

  /**
   * Updates visibility of caption and arrows based on zoom state
   */
  private updateUIElementsVisibility(): void {
    const isZoomed = this.isZoomedIn();
    const displayValue = isZoomed ? "none" : "block";
    const arrowDisplay =
      !isZoomed || this.shouldKeepArrowsVisible() ? "block" : displayValue;

    // Hide/show caption
    if (this.modalCaptionElement) {
      this.modalCaptionElement.style.display = displayValue;
    }

    // Hide/show arrows
    if (this.modalArrowLeftElement) {
      this.modalArrowLeftElement.style.display = arrowDisplay;
    }
    if (this.modalArrowRightElement) {
      this.modalArrowRightElement.style.display = arrowDisplay;
    }

    // Hide/show black stripe by toggling CSS class
    if (this.modalElement) {
      if (isZoomed) {
        this.modalElement.classList.add("modal--zoomed");
      } else {
        this.modalElement.classList.remove("modal--zoomed");
      }
    }
  }

  private shouldKeepArrowsVisible(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    return window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`).matches;
  }

  private calculatePanBounds(): PanBounds | null {
    if (!this.modalImageElement || !this.isZoomedIn()) {
      return null;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get the image's natural dimensions
    const naturalWidth = this.modalImageElement.naturalWidth;
    const naturalHeight = this.modalImageElement.naturalHeight;

    if (naturalWidth <= 0 || naturalHeight <= 0) {
      // Fallback: use getBoundingClientRect and divide by zoom
      const rect = this.modalImageElement.getBoundingClientRect();
      const baseWidth = rect.width / this.zoomScale;
      const baseHeight = rect.height / this.zoomScale;

      if (
        baseWidth <= 0 ||
        baseHeight <= 0 ||
        isNaN(baseWidth) ||
        isNaN(baseHeight)
      ) {
        return null;
      }

      return this.calculateBoundsFromSize(
        baseWidth,
        baseHeight,
        viewportWidth,
        viewportHeight,
      );
    }

    // Determine max height based on viewport
    let maxHeight: number;
    if (window.innerWidth >= 1024) {
      // desktop
      maxHeight = viewportHeight * 0.9;
    } else if (window.innerWidth >= 768) {
      // tablet
      maxHeight = viewportHeight * 0.8;
    } else {
      // mobile
      maxHeight = viewportHeight; // no height constraint, just width: 100%
    }

    // Calculate actual displayed size maintaining aspect ratio
    const imageAspect = naturalWidth / naturalHeight;
    const maxWidthAspect = viewportWidth / maxHeight;

    let displayedWidth: number;
    let displayedHeight: number;

    if (imageAspect > maxWidthAspect) {
      // Image is wider - width constrains
      displayedWidth = viewportWidth;
      displayedHeight = viewportWidth / imageAspect;
    } else {
      // Image is taller - height constrains
      displayedHeight = maxHeight;
      displayedWidth = maxHeight * imageAspect;
    }

    // Use calculated dimensions as base size
    return this.calculateBoundsFromSize(
      displayedWidth,
      displayedHeight,
      viewportWidth,
      viewportHeight,
    );
  }

  /**
   * Calculates pan bounds from base image dimensions
   */
  private calculateBoundsFromSize(
    baseWidth: number,
    baseHeight: number,
    viewportWidth: number,
    viewportHeight: number,
  ): PanBounds {
    // Calculate zoomed dimensions
    const zoomedWidth = baseWidth * this.zoomScale;
    const zoomedHeight = baseHeight * this.zoomScale;

    // Calculate how much the zoomed image extends beyond the viewport
    const excessWidth = Math.max(0, zoomedWidth - viewportWidth);
    const excessHeight = Math.max(0, zoomedHeight - viewportHeight);

    // If there's no excess, image fits in viewport, so no panning allowed
    if (excessWidth === 0 && excessHeight === 0) {
      return {
        maxX: 0,
        maxY: 0,
      };
    }

    const maxX = excessWidth > 0 ? excessWidth / 2 : 0;
    const maxY = excessHeight > 0 ? excessHeight / 2 : 0;

    return {
      maxX: maxX,
      maxY: maxY,
    };
  }

  /**
   * Constrains pan values within calculated bounds
   */
  private constrainPan(): void {
    if (!this.modalImageElement || !this.isZoomedIn()) {
      this.panX = 0;
      this.panY = 0;
      return;
    }

    const bounds = this.calculatePanBounds();

    if (!bounds) {
      this.panX = 0;
      this.panY = 0;
      return;
    }

    this.panX = Math.max(-bounds.maxX, Math.min(bounds.maxX, this.panX));
    this.panY = Math.max(-bounds.maxY, Math.min(bounds.maxY, this.panY));

    // If bounds were applied, ensure we're not going out of range
    if (isNaN(this.panX) || !isFinite(this.panX)) {
      this.panX = 0;
    }
    if (isNaN(this.panY) || !isFinite(this.panY)) {
      this.panY = 0;
    }
  }

  private startDrag(clientX: number, clientY: number): void {
    if (!this.isZoomedIn()) {
      return;
    }

    this.dragState.isDragging = true;
    this.dragState.hasMoved = false;
    this.dragState.startX = clientX - this.panX;
    this.dragState.startY = clientY - this.panY;

    if (this.modalImageElement) {
      this.modalImageElement.classList.add("dragging");
    }

    this.updateCursor();
  }

  private onDrag(clientX: number, clientY: number): void {
    if (!this.dragState.isDragging || !this.isZoomedIn()) {
      return;
    }

    // Mark that mouse has moved (to distinguish click from drag)
    const deltaX = Math.abs(clientX - (this.dragState.startX + this.panX));
    const deltaY = Math.abs(clientY - (this.dragState.startY + this.panY));
    if (deltaX > 5 || deltaY > 5) {
      this.dragState.hasMoved = true;
    }

    // Calculate new pan values
    this.panX = clientX - this.dragState.startX;
    this.panY = clientY - this.dragState.startY;

    // Constrain the pan values to prevent dragging beyond image edges
    this.constrainPan();
    this.applyTransform();
  }

  private endDrag(): boolean {
    const wasDragging = this.dragState.isDragging;
    const hadMoved = this.dragState.hasMoved;

    this.dragState.isDragging = false;
    this.dragState.hasMoved = false;

    if (this.modalImageElement) {
      this.modalImageElement.classList.remove("dragging");
    }

    this.updateCursor();

    // Return whether this was actually a drag (not just a click)
    return wasDragging && hadMoved;
  }

  /**
   * Handles mouse wheel events for panning when zoomed
   * @param event - Wheel event
   */
  private handleWheel(event: WheelEvent): void {
    if (!this.isZoomedIn()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.deltaX ?? 0;
    const deltaY = event.deltaY ?? 0;

    // Apply scroll to pan with speed multiplier
    this.panX += deltaX * PAN_CONFIG.SCROLL_SPEED;
    this.panY += deltaY * PAN_CONFIG.SCROLL_SPEED;

    this.constrainPan();
    this.applyTransform();
  }

  /**
   * Updates cursor style based on zoom and drag state
   */
  private updateCursor(): void {
    if (!this.modalImageElement) {
      return;
    }

    if (this.isZoomedIn()) {
      if (this.dragState.isDragging) {
        this.modalImageElement.style.cursor = "grabbing";
      } else {
        // Show zoom-out cursor when zoomed in (not dragging)
        this.modalImageElement.style.cursor = this.cursorZoomOutValue;
      }
    } else {
      // Show magnifying glass cursor when not zoomed
      this.modalImageElement.style.cursor = this.cursorZoomInValue;
    }
  }

  /**
   * Sets up pan/drag event handlers for mouse and touch
   */
  private setupPanHandlers(): void {
    if (!this.modalImageElement) {
      return;
    }

    // Mouse drag handlers - use left mouse button click-and-drag
    this.modalImageElement.addEventListener("mousedown", (e) => {
      // Only handle left mouse button (button 0)
      if (e.button === 0) {
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
        this.isMouseDown = true;
        this.canToggleZoomOnClick = true; // Allow zoom toggle unless mouse moves

        if (this.isZoomedIn()) {
          e.preventDefault(); // Prevent text selection and default behaviors
          e.stopPropagation();
          this.startDrag(e.clientX, e.clientY);
        }
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (this.dragState.isDragging) {
        e.preventDefault(); // Prevent default behavior during drag
        this.onDrag(e.clientX, e.clientY);
      } else if (this.isMouseDown) {
        // Track if mouse moved significantly during mousedown (to distinguish click from drag)
        const deltaX = Math.abs(e.clientX - this.mouseDownX);
        const deltaY = Math.abs(e.clientY - this.mouseDownY);
        if (deltaX > 5 || deltaY > 5) {
          // Mouse moved significantly, this is a drag, not a click
          this.canToggleZoomOnClick = false;
        }
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (this.dragState.isDragging) {
        e.preventDefault(); // Prevent default behavior on release
        const wasActualDrag = this.endDrag();
        // If it was an actual drag (not just a click), don't trigger zoom toggle
        if (wasActualDrag) {
          this.canToggleZoomOnClick = false;
        }
      }

      // Reset flags after a delay to allow click event to fire first
      setTimeout(() => {
        if (!this.dragState.isDragging) {
          this.isMouseDown = false;
          this.canToggleZoomOnClick = false;
        }
      }, 100);
    });

    // Handle mouse leaving window while dragging (cancel drag)
    document.addEventListener("mouseleave", () => {
      if (this.dragState.isDragging) {
        this.endDrag();
      }
      this.canToggleZoomOnClick = false;
      this.isMouseDown = false;
    });

    // Prevent context menu on right-click while dragging
    this.modalImageElement.addEventListener("contextmenu", (e) => {
      if (this.isZoomedIn()) {
        e.preventDefault();
      }
    });

    // Touch handlers for one-finger scrolling/panning
    this.modalImageElement.addEventListener(
      "touchstart",
      (e) => {
        // Only handle single touch (one finger)
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          this.touchStartX = touch.clientX;
          this.touchStartY = touch.clientY;
          this.touchStartTime = Date.now();
          this.touchLastX = touch.clientX;
          this.touchLastY = touch.clientY;
          this.isTouchActive = true;
          this.canToggleZoomOnClick = true;

          // If zoomed in, start dragging immediately for one-finger panning
          if (this.isZoomedIn()) {
            e.stopPropagation();
            this.startDrag(touch.clientX, touch.clientY);
          }
        }
      },
      { passive: true },
    );

    this.modalImageElement.addEventListener(
      "touchmove",
      (e) => {
        // Only handle single touch (one finger)
        if (e.touches.length === 1 && this.isTouchActive) {
          const touch = e.touches[0];
          this.touchLastX = touch.clientX;
          this.touchLastY = touch.clientY;
          const deltaX = Math.abs(touch.clientX - this.touchStartX);
          const deltaY = Math.abs(touch.clientY - this.touchStartY);

          // If moved significantly, it's a drag/pan, not a tap
          if (deltaX > 3 || deltaY > 3) {
            this.canToggleZoomOnClick = false;
          }

          if (this.isZoomedIn()) {
            // One-finger panning when zoomed in
            e.preventDefault();
            e.stopPropagation();

            if (this.dragState.isDragging) {
              // Continue dragging/panning
              this.onDrag(touch.clientX, touch.clientY);
            } else {
              // Start dragging if not already started
              this.startDrag(touch.clientX, touch.clientY);
              this.onDrag(touch.clientX, touch.clientY);
            }
          }
        }
      },
      { passive: false },
    );

    this.modalImageElement.addEventListener("touchend", (e) => {
      if (this.dragState.isDragging) {
        // End one-finger panning
        this.endDrag();
      } else if (this.isTouchActive) {
        const touchDuration = Date.now() - this.touchStartTime;
        const touch = e.changedTouches[0];
        const endX = touch?.clientX ?? this.touchLastX ?? this.touchStartX;
        const endY = touch?.clientY ?? this.touchLastY ?? this.touchStartY;
        const handledSwipe = this.handleSwipeGesture(endX, endY, touchDuration);
        if (handledSwipe) {
          e.preventDefault();
          e.stopPropagation();
        } else if (this.canToggleZoomOnClick && touchDuration < 300) {
          // Quick tap (less than 300ms) toggles zoom
          e.preventDefault();
          e.stopPropagation();
          this.toggleZoom();
        }
      }

      this.isTouchActive = false;
      this.canToggleZoomOnClick = false;
    });

    this.modalImageElement.addEventListener("touchcancel", () => {
      if (this.dragState.isDragging) {
        this.endDrag();
      }
      this.isTouchActive = false;
      this.canToggleZoomOnClick = false;
    });

    // Mouse wheel handler
    if (this.modalElement) {
      this.modalElement.addEventListener("wheel", (e) => this.handleWheel(e), {
        passive: false,
      });
    }

    this.updateCursor();
  }

  /**
   * Detects horizontal swipe gestures to change images on touch devices
   */
  private handleSwipeGesture(
    endX: number,
    endY: number,
    duration: number,
  ): boolean {
    if (this.isZoomedIn()) {
      return false;
    }

    const deltaX = endX - this.touchStartX;
    const deltaY = endY - this.touchStartY;

    if (
      Math.abs(deltaX) < SWIPE_CONFIG.MIN_DISTANCE ||
      Math.abs(deltaX) <= Math.abs(deltaY) ||
      duration > SWIPE_CONFIG.MAX_DURATION
    ) {
      return false;
    }

    const direction: NavigationDirection = deltaX < 0 ? 1 : -1;
    this.changeImage(direction);
    this.canToggleZoomOnClick = false;
    return true;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.modalElement || this.modalElement.style.display !== "block") {
      return;
    }

    switch (event.key) {
      case KEY_CODES.ESCAPE:
        this.closeModal();
        break;
      case KEY_CODES.ARROW_LEFT:
        this.changeImage(-1);
        break;
      case KEY_CODES.ARROW_RIGHT:
        this.changeImage(1);
        break;
    }
  }

  /**
   * Attaches all event listeners
   */
  private attachEventListeners(): void {
    // Close button
    const closeButton = document.getElementById(DOM_IDS.MODAL_CLOSE);
    if (closeButton) {
      closeButton.addEventListener("click", () => this.closeModal());
    }

    // Navigation arrows
    const leftArrow = document.getElementById(DOM_IDS.MODAL_ARROW_LEFT);
    const rightArrow = document.getElementById(DOM_IDS.MODAL_ARROW_RIGHT);

    if (leftArrow) {
      leftArrow.addEventListener("click", () => this.changeImage(-1));
    }

    if (rightArrow) {
      rightArrow.addEventListener("click", () => this.changeImage(1));
    }

    // Close modal when clicking outside the image
    if (this.modalElement) {
      this.modalElement.addEventListener("click", (event) => {
        if (event.target === this.modalElement) {
          this.closeModal();
        }
      });
    }

    // Click on image to toggle zoom
    if (this.modalImageElement) {
      this.modalImageElement.addEventListener("click", (e) => {
        if (
          !this.dragState.isDragging &&
          e.target === this.modalImageElement &&
          this.canToggleZoomOnClick
        ) {
          e.stopPropagation();
          e.preventDefault();
          this.toggleZoom();

          // Reset flags after zoom toggle
          this.isMouseDown = false;
          this.canToggleZoomOnClick = false;
        }
      });
    }

    // Zoom button
    const zoomButton = document.getElementById(DOM_IDS.MODAL_ZOOM);
    if (zoomButton) {
      zoomButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleZoom();
      });
    }

    // Pan/drag handlers
    this.setupPanHandlers();

    // Keyboard navigation
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }
}

export function initializeImageModal(
  baseUrl: string,
  imageData: ImageData,
): ImageModalController {
  const modalController = new ImageModalController(baseUrl, imageData);

  // Expose functions globally for backward compatibility
  (window as any).openModal = (img: HTMLImageElement) =>
    modalController.openModal(img);
  (window as any).changeImage = (direction: number) =>
    modalController.changeImage(direction as NavigationDirection);
  (window as any).closeModal = () => modalController.closeModal();

  return modalController;
}
