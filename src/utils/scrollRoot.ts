/** Page scroll lives on `body` so iOS Chrome cannot rubber-band the document. */

export function getScrollRoot(): HTMLElement {
  return document.body;
}

export function getScrollY(): number {
  return getScrollRoot().scrollTop;
}

export function getScrollX(): number {
  return getScrollRoot().scrollLeft;
}

export function scrollTo(options: ScrollToOptions): void {
  getScrollRoot().scrollTo(options);
}
