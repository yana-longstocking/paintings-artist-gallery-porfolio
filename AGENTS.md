# Agent Guide

Instructions for AI agents and contributors working on this repository. Follow these conventions on every change unless the user explicitly asks otherwise.

## Project overview

Static artist portfolio and gallery site for Iryna Romanska. The site showcases artwork collections, artist bio, contact form, and individual artwork detail pages. Content is available in English (default) and Spanish.

## Tech stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Framework  | [Astro](https://astro.build/) 5.x (static site generation)     |
| Language   | TypeScript (client scripts only), Astro components (`.astro`)  |
| Styles     | SCSS/Sass with BEM methodology                                 |
| Formatting | Prettier + `prettier-plugin-astro`                             |
| Runtime    | Node.js 22 (`see .nvmrc`)                                      |
| Deployment | Static build (`dist/`) — site URL: `https://irynaromanska.com` |

### Key dependencies

- `astro` — pages, components, build
- `sass` — SCSS compilation
- `prettier`, `prettier-plugin-astro` — code formatting

### NPM scripts

```bash
npm run dev      # local dev server (http://localhost:4321)
npm run build    # production build
npm run preview  # preview production build
npm run lint:fix # format with Prettier
```

## Project structure

```
src/
  components/          # Astro components (.astro) and co-located client scripts
  pages/               # File-based routing (EN)
  pages/es/            # Spanish routes (mirror of EN pages under /es)
  data/                # Gallery JSON (gallery.json, gallery-es.json)
  styles/
    global.scss        # Single entry point — imports all block styles
    blocks/            # One SCSS file per BEM block
public/                # Static assets (images, icons, favicon)
```

### Routing & i18n

- English pages live at `/`, `/gallery`, `/artwork/[id]`, etc.
- Spanish pages live at `/es/`, `/es/gallery`, `/es/artwork/[id]`, etc.
- When adding or editing pages, keep EN and ES routes in sync.
- Gallery data: `src/data/gallery.json` (EN), `src/data/gallery-es.json` (ES).

### Components & scripts

- Use `BaseLayout.astro` as the page shell (imports `global.scss`, header, footer).
- Place reusable UI in `src/components/`.
- Client-side interactivity: separate `*.client.ts` files imported from Astro `<script>` tags.
- Shared logic modules live alongside components (e.g. `ImageModal/ImageModal.ts`).

## Code conventions

### 1. BEM (required)

All CSS class names must follow [BEM](https://getbem.com/):

| Pattern  | Example                                             |
| -------- | --------------------------------------------------- |
| Block    | `.header`, `.gallery-page`, `.artist-bio`           |
| Element  | `.header__nav`, `.header__logo-link`                |
| Modifier | `.header__action--lang`, `.container__line--static` |

Rules:

- One block name per component/section. The block name matches the SCSS filename (e.g. `header.scss` → `.header`).
- Use `__` for elements, `--` for modifiers. Do not use nested selectors that break BEM (e.g. `.header .nav a`).
- In HTML/Astro templates, apply BEM classes directly — avoid utility-class frameworks.
- SCSS nesting mirrors BEM: nest `&__element` and `&--modifier` inside the block selector.

**Good (HTML + SCSS):**

```html
<header class="header">
  <nav class="header__nav">
    <a class="header__logo-link header__logo-link--active" href="/">…</a>
  </nav>
</header>
```

```scss
.header {
  &__nav { … }
  &__logo-link {
    …
    &--active { … }
  }
}
```

**Avoid:**

```html
<div class="nav-wrapper">
  <a class="logo active">…</a>
</div>
```

```scss
.header nav a.active { … }  // non-BEM descendant selectors
```

### 2. SCSS breakpoints via mixins (required)

Never write raw `@media` queries for **layout breakpoints**. Use the mixins from `src/styles/blocks/mixin.scss`:

| Mixin                             | Min-width | Use for                                   |
| --------------------------------- | --------- | ----------------------------------------- |
| `@include mixin.on-mobile`        | 320px     | Optional tweaks from small-phone width up |
| `@include mixin.on-tablet`        | 744px     | Tablet layout and up                      |
| `@include mixin.on-desktop`       | 1260px    | Desktop layout and up                     |
| `@include mixin.on-large-desktop` | 1600px    | Large screens and up                      |

Breakpoint values are defined once in `src/styles/blocks/variables.scss`. Do not hardcode pixel values for these breakpoints elsewhere (including `matchMedia` in client scripts — use `src/constants/breakpoints.ts`, which must stay in sync).

#### Mobile-first breakpoints (required)

The project is **mobile-first**: styles apply to the smallest viewport by default, then **progressively enhance** at larger breakpoints.

| Rule                 | Do                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Default block styles | Target the smallest layout (phones). No `min-width` wrapper needed.                                                             |
| Larger layouts       | Add rules inside `@include mixin.on-tablet`, `on-desktop`, or `on-large-desktop`.                                               |
| Spacing & typography | Use fixed values or tokens from `variables.scss` at each breakpoint. Do **not** use `clamp()` for layout spacing.               |
| Design tokens        | Put repeated spacing, gaps, and padding in `variables.scss` — only when the same value appears **3 or more times** (see below). |

**Do not use `max-width` media queries for layout breakpoints** (e.g. `@media (max-width: 743px)`). If something should only apply below tablet, make it the **default** and override it from `on-tablet` upward.

#### Design token threshold (required)

Add a spacing, gap, or padding token to `variables.scss` only when the same value appears **3 or more times** across the codebase (count literal values and `clamp()` expressions that resolve to the same responsive intent). A mobile/tablet/desktop token set counts as one extracted pattern.

- **3+ uses** → add tokens (e.g. `$gallery-grid-gap-mobile`, `$gallery-grid-gap-tablet`, `$gallery-grid-gap-desktop`).
- **1–2 uses** → keep the value inline in the block SCSS file; do not create a token.

**Allowed raw `@media` queries** (not layout breakpoints):

- `@media (hover: hover)` / `(pointer: fine)` — hover-capable devices
- `@media (hover: none)` — touch-first press states
- `@media (prefers-reduced-motion: reduce)` — accessibility

**Good (mobile-first SCSS):**

```scss
@use "mixin";
@use "variables";

.photo-art {
  padding-bottom: 0;
  gap: variables.$gallery-mobile-item-gap;

  @include mixin.on-tablet {
    padding-bottom: variables.$gallery-section-padding-bottom-tablet;
    gap: variables.$gallery-grid-gap-tablet;
  }

  @include mixin.on-desktop {
    padding-bottom: variables.$gallery-section-padding-bottom-desktop;
    gap: variables.$gallery-grid-gap-desktop;
  }
}
```

**Good (client script — min-width, shared constant):**

```ts
import { TABLET_MIN_WIDTH } from "../constants/breakpoints";

if (window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`).matches) {
  initTabletFeature();
}
```

**Avoid:**

```scss
@media (min-width: 744px) { … }              // use mixin.on-tablet
@media (max-width: 743px) { … }              // make it the default; override in on-tablet
padding: clamp(40px, 6vw, 72px);             // use tokens + breakpoint mixins
```

```js
window.matchMedia("(max-width: 743px)"); // desktop-first; use min-width + breakpoints.ts
```

**Good (legacy example — still valid):**

```scss
.artist-bio {
  padding: 40px 0;

  @include mixin.on-tablet {
    padding: 60px 0;
  }

  @include mixin.on-desktop {
    padding: 80px 0;
  }
}
```

**Avoid (legacy anti-patterns):**

```scss
@media (min-width: 744px) { … }           // use mixin.on-tablet instead
@media (max-width: 743px) { … }           // prefer mobile-first + min-width mixins
padding: 20px; @media (min-width: 1260px) { padding: 120px; }  // inline breakpoint values
```

Other shared mixins in `mixin.scss` (use when relevant):

- `page-background` — site background gradient
- `page-grid` — responsive column grid
- `hover`, `transition-mixin`, `button-mixin` — shared interaction patterns

### 3. SCSS file organization

- Global styles entry: `src/styles/global.scss` — add new block imports here.
- Block styles: `src/styles/blocks/<block-name>.scss` — one file per BEM block.
- Always use `@use` (not deprecated `@import`) and reference variables/mixins by namespace:

  ```scss
  @use "mixin";
  @use "variables";

  .my-block {
    color: variables.$main-color;
    @include mixin.on-desktop { … }
  }
  ```

- Design tokens (colors, durations, breakpoints) belong in `variables.scss`. Reuse them instead of duplicating values. For spacing/gaps/padding, follow the **3+ uses** rule above — do not tokenize one-off values.
- Component-specific styles that don't map to a global block may live next to the component (e.g. `ImageModal/ImageModal.scss`), but must still follow BEM and mixin rules.

### 4. Astro & TypeScript

- Keep `.astro` frontmatter for data fetching and props; minimize inline logic in templates.
- Use TypeScript interfaces for component props.
- Prefer small, focused client scripts over large inline `<script>` blocks.
- Static assets go in `public/`; reference them with root-relative paths (`/icons/logo.svg`).

### 5. Formatting

- Run `npm run lint:fix` (Prettier) before finishing work.
- Match existing indentation and naming in surrounding files.
- Keep changes scoped — do not refactor unrelated code.

## Checklist for agents

Before submitting changes, verify:

- [ ] New/changed CSS classes follow BEM (`block__element`, `block__element--modifier`)
- [ ] Responsive styles use mobile-first `@include mixin.on-*` — no `max-width` layout queries, no raw breakpoint `@media`
- [ ] Layout spacing uses `variables.scss` tokens — no `clamp()` for responsive spacing; new spacing tokens only for values used 3+ times
- [ ] Colors, spacing tokens, and breakpoints come from `variables.scss` / `mixin.scss` / `constants/breakpoints.ts`
- [ ] New block styles are added to `global.scss` via `@use`
- [ ] EN and ES routes/data stay in sync when pages or content change
- [ ] Prettier has been run on edited files
