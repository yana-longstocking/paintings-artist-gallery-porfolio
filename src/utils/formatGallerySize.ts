/** Strips localized "Size:" / "Medidas:" prefixes for compact gallery captions. */
export function formatGallerySize(size: string): string {
  return size.replace(/^(Size|Medidas):\s*/i, "");
}

/** Shortens collection-prefixed titles for mobile masonry cards. */
export function formatGalleryTitle(title: string): string {
  return title
    .replace(/^Freedom collection\.\s*/i, "")
    .replace(/^Colección Libertad\.\s*/i, "")
    .trim();
}
