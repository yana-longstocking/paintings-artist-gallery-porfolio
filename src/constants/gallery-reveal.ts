/**
 * Gallery scroll-reveal stagger timing (seconds).
 * Used by GalleryScrollReveal.client.ts for transition-delay.
 */
export const GALLERY_REVEAL_STAGGER_STEP_S = 0.12;
export const GALLERY_REVEAL_STAGGER_BASE_S = 0.06;

export function galleryRevealStaggerDelaySeconds(index: number): number {
  return index * GALLERY_REVEAL_STAGGER_STEP_S + GALLERY_REVEAL_STAGGER_BASE_S;
}
