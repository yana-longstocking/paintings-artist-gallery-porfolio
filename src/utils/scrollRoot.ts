/** Shared scroll helpers for document scrolling and timed smooth scroll. */

const SMOOTH_SCROLL_MIN_DURATION_MS = 700;
const SMOOTH_SCROLL_MAX_DURATION_MS = 2000;
const SMOOTH_SCROLL_MS_PER_PX = 0.75;

export interface SmoothScrollTiming {
  minDurationMs?: number;
  maxDurationMs?: number;
  msPerPx?: number;
  easing?: (progress: number) => number;
}

function easeOutQuint(progress: number): number {
  return 1 - (1 - progress) ** 5;
}

export function easeInOutCubic(progress: number): number {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

/** Fast smooth scroll for artwork scroll-up button */
export const SMOOTH_SCROLL_TIMING_FAST: SmoothScrollTiming = {
  minDurationMs: 1100,
  maxDurationMs: 1600,
  msPerPx: 0.62,
  easing: easeInOutCubic,
};

/** Slightly slower scroll for gallery page scroll-up button */
export const SMOOTH_SCROLL_TIMING_GALLERY: SmoothScrollTiming = {
  minDurationMs: 1300,
  maxDurationMs: 1900,
  msPerPx: 0.74,
  easing: easeInOutCubic,
};

/** Faster gallery scroll-up on tablet */
export const SMOOTH_SCROLL_TIMING_GALLERY_TABLET: SmoothScrollTiming = {
  minDurationMs: 900,
  maxDurationMs: 1400,
  msPerPx: 0.55,
  easing: easeInOutCubic,
};

const DEFAULT_SMOOTH_SCROLL_TIMING: Required<
  Omit<SmoothScrollTiming, "easing">
> & {
  easing: (progress: number) => number;
} = {
  minDurationMs: SMOOTH_SCROLL_MIN_DURATION_MS,
  maxDurationMs: SMOOTH_SCROLL_MAX_DURATION_MS,
  msPerPx: SMOOTH_SCROLL_MS_PER_PX,
  easing: easeOutQuint,
};

let activeSmoothScrollFrame = 0;
let restoreScrollBehavior: (() => void) | null = null;

function resolveSmoothScrollTiming(
  timing?: SmoothScrollTiming,
): typeof DEFAULT_SMOOTH_SCROLL_TIMING {
  return {
    minDurationMs:
      timing?.minDurationMs ?? DEFAULT_SMOOTH_SCROLL_TIMING.minDurationMs,
    maxDurationMs:
      timing?.maxDurationMs ?? DEFAULT_SMOOTH_SCROLL_TIMING.maxDurationMs,
    msPerPx: timing?.msPerPx ?? DEFAULT_SMOOTH_SCROLL_TIMING.msPerPx,
    easing: timing?.easing ?? DEFAULT_SMOOTH_SCROLL_TIMING.easing,
  };
}

function lockScrollBehavior(root: HTMLElement): void {
  restoreScrollBehavior?.();
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  restoreScrollBehavior = () => {
    root.style.scrollBehavior = previousBehavior;
    restoreScrollBehavior = null;
  };
}

function unlockScrollBehavior(): void {
  restoreScrollBehavior?.();
}

function setScrollPosition(
  _root: HTMLElement,
  top: number,
  left: number,
): void {
  const root =
    (document.scrollingElement as HTMLElement | null) ??
    document.documentElement;
  root.scrollTop = top;
  root.scrollLeft = left;
  window.scrollTo({ top, left, behavior: "auto" });
}

function smoothScrollRootTo(
  root: HTMLElement,
  targetTop: number,
  targetLeft: number,
  timing: SmoothScrollTiming = {},
): void {
  const resolvedTiming = resolveSmoothScrollTiming(timing);
  if (activeSmoothScrollFrame) {
    cancelAnimationFrame(activeSmoothScrollFrame);
    activeSmoothScrollFrame = 0;
  }

  unlockScrollBehavior();

  const startTop = getScrollY();
  const startLeft = getScrollX();
  const distanceTop = targetTop - startTop;
  const distanceLeft = targetLeft - startLeft;

  if (distanceTop === 0 && distanceLeft === 0) return;

  lockScrollBehavior(root);

  const duration = Math.min(
    resolvedTiming.maxDurationMs,
    Math.max(
      resolvedTiming.minDurationMs,
      Math.abs(distanceTop) * resolvedTiming.msPerPx,
    ),
  );
  const startTime = performance.now();

  const step = (currentTime: number): void => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = resolvedTiming.easing(progress);

    setScrollPosition(
      root,
      startTop + distanceTop * eased,
      startLeft + distanceLeft * eased,
    );

    if (progress < 1) {
      activeSmoothScrollFrame = requestAnimationFrame(step);
      return;
    }

    activeSmoothScrollFrame = 0;
    setScrollPosition(root, targetTop, targetLeft);
    unlockScrollBehavior();
  };

  activeSmoothScrollFrame = requestAnimationFrame(step);
}

export function getScrollRoot(): HTMLElement {
  return (
    (document.scrollingElement as HTMLElement | null) ??
    document.documentElement
  );
}

export function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function getScrollX(): number {
  return window.scrollX || document.documentElement.scrollLeft || 0;
}

export function scrollTo(
  options: ScrollToOptions,
  smoothTiming?: SmoothScrollTiming,
): void {
  const root = getScrollRoot();
  const top = options.top ?? getScrollY();
  const left = options.left ?? getScrollX();

  if (options.behavior === "smooth") {
    smoothScrollRootTo(root, top, left, smoothTiming);
    return;
  }

  unlockScrollBehavior();
  setScrollPosition(root, top, left);
}
