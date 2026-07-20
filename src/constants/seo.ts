export const SITE_NAME = "Iryna Romanska";
export const SITE_URL = "https://irynaromanska.com";
export const ARTIST_EMAIL = "iryromanska@gmail.com";
export const ARTIST_INSTAGRAM =
  "https://www.instagram.com/romanska13?igsh=MXcxdGticmZvd3Y4bQ==";
export const DEFAULT_OG_IMAGE = "/photo/artist/artist-bio.jpg";

export type SeoLocale = "en" | "es";

export const seoCopy = {
  en: {
    homeTitle: "Iryna Romanska — Pencil Artist in Madrid",
    homeDescription:
      "Ukrainian pencil artist based in Madrid. Explore highly detailed figurative drawings, the Freedom Collection, and contemporary works by Iryna Romanska.",
    galleryTitle: "Gallery — Iryna Romanska",
    galleryDescription:
      "Browse the Freedom Collection and full painting gallery of contemporary pencil drawings by Iryna Romanska.",
    artworkDescriptionFallback: (title: string) =>
      `${title} — pencil artwork by Iryna Romanska. View details, medium, and size.`,
  },
  es: {
    homeTitle: "Iryna Romanska — Artista de lápiz en Madrid",
    homeDescription:
      "Artista ucraniana de lápiz basada en Madrid. Explora dibujos figurativos detallados, la Colección Libertad y obras contemporáneas de Iryna Romanska.",
    galleryTitle: "Galería — Iryna Romanska",
    galleryDescription:
      "Explora la Colección Libertad y la galería completa de dibujos contemporáneos a lápiz de Iryna Romanska.",
    artworkDescriptionFallback: (title: string) =>
      `${title} — obra a lápiz de Iryna Romanska. Ver detalles, técnica y tamaño.`,
  },
} as const;

export function getLocaleFromPath(pathname: string): SeoLocale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

/** Normalize pathname for canonical / hreflang (trailing slash only on home). */
export function normalizePath(pathname: string): string {
  if (pathname === "/" || pathname === "/es" || pathname === "/es/") {
    return pathname.startsWith("/es") ? "/es/" : "/";
  }
  return pathname.replace(/\/+$/, "") || "/";
}

export function getAlternatePaths(pathname: string): {
  en: string;
  es: string;
} {
  const path = normalizePath(pathname);

  if (path === "/es/" || path.startsWith("/es/")) {
    const enPath = path === "/es/" ? "/" : path.replace(/^\/es/, "") || "/";
    return { en: enPath, es: path };
  }

  const esPath = path === "/" ? "/es/" : `/es${path}`;
  return { en: path, es: esPath };
}

export function toAbsoluteUrl(path: string, site = SITE_URL): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = site.replace(/\/+$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
