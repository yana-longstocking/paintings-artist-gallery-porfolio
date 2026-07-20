export const GALLERY_REVEAL_STAGGER_STEP_S = 0.12;
export const GALLERY_REVEAL_STAGGER_BASE_S = 0.06;
export const GALLERY_REVEAL_STAGGER_STEP_S_TABLET = 0.18;
export const GALLERY_REVEAL_STAGGER_BASE_S_TABLET = 0.12;

export const GALLERY_HERO_INTRO_MS = 3100;
export const GALLERY_HERO_INTRO_MS_TABLET = 1750;

export function galleryRevealStaggerDelaySeconds(index: number): number {
  return index * GALLERY_REVEAL_STAGGER_STEP_S + GALLERY_REVEAL_STAGGER_BASE_S;
}

export function galleryRevealStaggerDelaySecondsTablet(index: number): number {
  return (
    index * GALLERY_REVEAL_STAGGER_STEP_S_TABLET +
    GALLERY_REVEAL_STAGGER_BASE_S_TABLET
  );
}
