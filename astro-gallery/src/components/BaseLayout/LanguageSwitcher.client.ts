type LanguageCode = "en" | "es";

interface LanguageConfig {
  code: LanguageCode;
  displayText: string;
  pathPrefix: string;
}

interface MenuTranslations {
  gallery: string;
  artistBio: string;
  contactUs: string;
}

interface TranslationMap {
  [key: string]: MenuTranslations;
}

interface DOMElements {
  switcher: HTMLElement | null;
  currentLangText: HTMLElement | null;
  menu: HTMLElement | null;
  options: NodeListOf<Element>;
  menuLinks: NodeListOf<Element>;
}

const LANGUAGE_CONFIG: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: "en",
    displayText: "EN",
    pathPrefix: "",
  },
  es: {
    code: "es",
    displayText: "ES",
    pathPrefix: "/es",
  },
};

const MENU_TRANSLATIONS: TranslationMap = {
  es: {
    gallery: "Galería",
    artistBio: "Biografía del Artista",
    contactUs: "Contáctanos",
  },
  en: {
    gallery: "Gallery",
    artistBio: "Artist Bio",
    contactUs: "Contact us",
  },
};

const SELECTORS = {
  switcher: "#language-switcher",
  currentLang: "#current-lang",
  menu: "#language-menu",
  languageOption: ".header__language-option",
  menuLink: ".header__menu-link",
  openMenuClass: "header__language-menu--open",
  activeOptionClass: "header__language-option--active",
} as const;

const BASE_URL_PATTERNS = ["/paintings-artist-gallery-porfolio/"] as const;

/**
 * Safely gets an element by selector
 */
function getElement<T extends HTMLElement>(
  selector: string,
  required = false,
): T | null {
  const element = document.querySelector<T>(selector);
  if (required && !element) {
    console.warn(`Required element not found: ${selector}`);
  }
  return element;
}

/**
 * Gets all elements matching a selector
 */
function getElements(selector: string): NodeListOf<Element> {
  return document.querySelectorAll(selector);
}

/**
 * Detects the base URL from the document or current path
 */
function getBaseUrl(): string {
  // Try to get from <base> tag
  const baseTag = document.querySelector("base");
  if (baseTag?.href) {
    try {
      const baseUrl = new URL(baseTag.href);
      return baseUrl.pathname;
    } catch (error) {
      console.warn("Failed to parse base URL from <base> tag", error);
    }
  }

  // Fallback: detect from current path
  const currentPath = window.location.pathname;
  for (const pattern of BASE_URL_PATTERNS) {
    if (currentPath.includes(pattern)) {
      return pattern;
    }
  }

  return "/";
}

/**
 * Normalizes a path by removing base URL and ensuring proper format
 */
function normalizePath(path: string, baseUrl: string): string {
  let relativePath = path;

  // Remove base URL if present
  if (baseUrl !== "/" && path.startsWith(baseUrl)) {
    relativePath = path.replace(baseUrl, "/");
  }

  // Normalize empty paths
  if (!relativePath || relativePath === baseUrl || relativePath === "/") {
    return "/";
  }

  return relativePath;
}

/**
 * Constructs a full path with base URL
 */
function constructFullPath(relativePath: string, baseUrl: string): string {
  if (baseUrl === "/") {
    return relativePath;
  }

  // Remove leading slash from relative path
  const relative = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  // Ensure base URL ends with /
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return `${base}${relative}`;
}

/**
 * Detects the current language from the URL path
 */
function detectLanguage(): LanguageCode {
  const path = window.location.pathname;
  return path.includes("/es/") ? "es" : "en";
}

/**
 * Converts a path from one language to another
 */
function convertPath(
  currentPath: string,
  targetLang: LanguageCode,
  baseUrl: string,
): string {
  const relativePath = normalizePath(currentPath, baseUrl);
  const targetConfig = LANGUAGE_CONFIG[targetLang];
  const currentLang = detectLanguage();

  // If already on target language, return current path
  if (currentLang === targetLang) {
    return currentPath;
  }

  let newRelativePath = "";

  if (targetLang === "es") {
    // Converting to Spanish
    if (relativePath.startsWith("/artwork/")) {
      const artworkId = relativePath.replace("/artwork/", "");
      newRelativePath = `/es/artwork/${artworkId}`;
    } else if (relativePath === "/") {
      newRelativePath = "/es/";
    } else {
      newRelativePath = `/es${relativePath}`;
    }
  } else {
    // Converting to English (default - root paths)
    if (relativePath.startsWith("/es/artwork/")) {
      const artworkId = relativePath.replace("/es/artwork/", "");
      newRelativePath = `/artwork/${artworkId}`;
    } else if (relativePath.startsWith("/es/")) {
      newRelativePath = relativePath.replace("/es/", "/");
    } else if (relativePath === "/es/" || relativePath === "/es") {
      newRelativePath = "/";
    } else {
      newRelativePath = relativePath;
    }
  }

  return constructFullPath(newRelativePath, baseUrl);
}

class LanguageSwitcher {
  private elements: DOMElements;
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
    this.elements = this.initializeElements();

    if (!this.validateElements()) {
      console.warn(
        "Language switcher elements not found. Skipping initialization.",
      );
      return;
    }

    this.setupEventListeners();
    this.initializeState();
  }

  /**
   * Initializes and caches DOM elements
   */
  private initializeElements(): DOMElements {
    return {
      switcher: getElement<HTMLElement>(SELECTORS.switcher),
      currentLangText: getElement<HTMLElement>(SELECTORS.currentLang),
      menu: getElement<HTMLElement>(SELECTORS.menu),
      options: getElements(SELECTORS.languageOption),
      menuLinks: getElements(SELECTORS.menuLink),
    };
  }

  /**
   * Validates that required elements exist
   */
  private validateElements(): boolean {
    const { switcher, currentLangText, menu } = this.elements;
    return !!(switcher && currentLangText && menu);
  }

  /**
   * Initializes the UI state
   */
  private initializeState(): void {
    this.updateLanguageDisplay();
    this.translateHeaderMenu();
  }

  /**
   * Updates the language display text and active state
   */
  private updateLanguageDisplay(): void {
    const currentLang = detectLanguage();
    const config = LANGUAGE_CONFIG[currentLang];

    // Update display text
    if (this.elements.currentLangText) {
      this.elements.currentLangText.textContent = config.displayText;
    }

    // Update active state in dropdown
    this.elements.options.forEach((option) => {
      const lang = option.getAttribute("data-lang") as LanguageCode;
      if (lang === currentLang) {
        option.classList.add(SELECTORS.activeOptionClass);
      } else {
        option.classList.remove(SELECTORS.activeOptionClass);
      }
    });
  }

  /**
   * Translates header menu items based on current language
   */
  private translateHeaderMenu(): void {
    const currentLang = detectLanguage();
    const translations = MENU_TRANSLATIONS[currentLang];

    this.elements.menuLinks.forEach((link) => {
      const text = link.textContent?.trim().toLowerCase() || "";

      if (text.includes("gallery") || text.includes("galería")) {
        link.textContent = translations.gallery;
      } else if (text.includes("bio") || text.includes("biografía")) {
        link.textContent = translations.artistBio;
      } else if (text.includes("contact") || text.includes("contáctanos")) {
        link.textContent = translations.contactUs;
      }
    });
  }

  /**
   * Opens the language dropdown menu
   */
  private openDropdown(): void {
    const { menu, switcher } = this.elements;
    if (!menu || !switcher) return;

    menu.classList.add(SELECTORS.openMenuClass);
    switcher.setAttribute("aria-expanded", "true");
  }

  /**
   * Closes the language dropdown menu
   */
  private closeDropdown(): void {
    const { menu, switcher } = this.elements;
    if (!menu || !switcher) return;

    menu.classList.remove(SELECTORS.openMenuClass);
    switcher.setAttribute("aria-expanded", "false");
  }

  /**
   * Toggles the dropdown menu state
   */
  private toggleDropdown(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const { menu } = this.elements;
    if (!menu) return;

    const isOpen = menu.classList.contains(SELECTORS.openMenuClass);
    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Switches to the specified language
   */
  private switchLanguage(lang: LanguageCode): void {
    const currentPath = window.location.pathname;
    const newPath = convertPath(currentPath, lang, this.baseUrl);

    if (newPath !== currentPath) {
      window.location.href = newPath;
    } else {
      this.closeDropdown();
    }
  }

  /**
   * Handles click events on language options
   */
  private handleLanguageOptionClick(event: Event, option: Element): void {
    event.preventDefault();
    event.stopPropagation();

    const lang = option.getAttribute("data-lang") as LanguageCode;
    if (lang && (lang === "en" || lang === "es")) {
      this.switchLanguage(lang);
    }
  }

  /**
   * Handles clicks outside the dropdown
   */
  private handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const { switcher, menu } = this.elements;

    if (!switcher || !menu || !target) return;

    const clickedInsideButton = switcher.contains(target);
    const clickedInsideMenu = menu.contains(target);

    if (!clickedInsideButton && !clickedInsideMenu) {
      this.closeDropdown();
    }
  }

  /**
   * Handles keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.closeDropdown();
    }
  }

  /**
   * Sets up all event listeners
   */
  private setupEventListeners(): void {
    const { switcher, options } = this.elements;

    // Toggle button click
    switcher?.addEventListener("click", (e) => this.toggleDropdown(e));

    // Language option clicks
    options.forEach((option) => {
      option.addEventListener("click", (e) =>
        this.handleLanguageOptionClick(e, option),
      );
    });

    // Close on outside click
    document.addEventListener("click", (e) => this.handleOutsideClick(e));

    // Close on escape key
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }
}

/**
 * Initializes the language switcher when DOM is ready
 */
function initLanguageSwitcher(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      new LanguageSwitcher();
    });
  } else {
    new LanguageSwitcher();
  }
}

// Auto-initialize
initLanguageSwitcher();
