import {
  isDesktopLayout,
  isMobileLayout,
  isTabletLayout,
} from "../constants/breakpoints";

const SEQUENCE_SELECTORS = [
  ".artwork-detail__main-image",
  ".artwork-detail__title",
  ".artwork-detail__description",
  ".artwork-detail__description-spacer",
  ".artwork-detail__purchase-info",
  ".artwork-detail__additional-title",
  ".artwork-detail__gallery-item",
];

const INTRO_SELECTOR = [
  ".artwork-detail__main-image",
  ".artwork-detail__title",
  ".artwork-detail__description",
  ".artwork-detail__medium",
  ".artwork-detail__size",
  ".artwork-detail__price",
].join(", ");

const DETAILS_SELECTOR = [
  ".artwork-detail__additional-title",
  ".artwork-detail__gallery-item",
].join(", ");

const FOOTER_TEXT_SELECTOR =
  ".artwork-detail__footer-title, .artwork-detail__footer-text";
const FOOTER_ACTION_SELECTOR =
  ".artwork-detail__footer-link, .artwork-detail__footer-actions";

const CASCADE_STEP_MS = 85;

function initArtworkDetailScrollReveal(): void {
  const root = document.querySelector(".artwork-detail");
  if (!root) return;

  const introTargets = Array.from(root.querySelectorAll(INTRO_SELECTOR));
  const detailsTargets = Array.from(root.querySelectorAll(DETAILS_SELECTOR));
  const footerTextTargets = Array.from(
    root.querySelectorAll(FOOTER_TEXT_SELECTOR),
  );
  const footerActionTargets = Array.from(
    root.querySelectorAll(FOOTER_ACTION_SELECTOR),
  );
  const footerCopyright = root.querySelector(
    ".artwork-detail__footer-copyright",
  );

  const allTargets = [
    ...introTargets,
    ...detailsTargets,
    ...footerTextTargets,
    ...footerActionTargets,
    ...(footerCopyright ? [footerCopyright] : []),
  ];
  if (!allTargets.length) return;

  const revealAll = (targets: Element[]) => {
    targets.forEach((target) => {
      target.classList.add(
        "artwork-detail__target",
        "artwork-detail__target--visible",
      );
    });
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll(allTargets);
    return;
  }

  if (isMobileLayout()) {
    revealAll(allTargets);
    return;
  }

  if (isDesktopLayout() || isTabletLayout()) {
    initSequentialReveal(root, footerTextTargets, footerActionTargets);
  }
}

function initSequentialReveal(
  root: Element,
  footerTextTargets: Element[],
  footerActionTargets: Element[],
): void {
  const footerCopyright = root.querySelector(
    ".artwork-detail__footer-copyright",
  );

  const sequence = [
    ...SEQUENCE_SELECTORS.flatMap((selector) =>
      Array.from(root.querySelectorAll(selector)),
    ),
    ...footerTextTargets,
    ...footerActionTargets,
    ...(footerCopyright ? [footerCopyright] : []),
  ];

  if (!sequence.length) return;

  sequence.forEach((target) => {
    target.classList.add("artwork-detail__target");
  });

  const revealed = new Set<Element>();
  let revealIndex = 0;
  let cascadeTimer: number | null = null;

  const isEntering = (target: Element) => {
    const rect = target.getBoundingClientRect();
    return rect.top < window.innerHeight * 1.05 && rect.bottom > 0;
  };

  const markRevealed = (target: Element) => {
    if (revealed.has(target)) return;
    revealed.add(target);
    target.classList.add("artwork-detail__target--visible");
  };

  const cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    if (cascadeTimer !== null) {
      window.clearTimeout(cascadeTimer);
      cascadeTimer = null;
    }
  };

  const continueCascade = () => {
    if (revealIndex >= sequence.length) {
      cleanup();
      return;
    }

    const next = sequence[revealIndex];
    if (!isEntering(next)) return;

    markRevealed(next);
    revealIndex += 1;

    if (revealIndex >= sequence.length) {
      cleanup();
      return;
    }

    cascadeTimer = window.setTimeout(() => {
      cascadeTimer = null;
      continueCascade();
    }, CASCADE_STEP_MS);
  };

  const onScroll = () => {
    if (cascadeTimer !== null) return;
    continueCascade();
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      continueCascade();
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtworkDetailScrollReveal);
} else {
  initArtworkDetailScrollReveal();
}
