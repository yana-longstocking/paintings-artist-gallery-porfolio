type LanguageCode = string;

interface LanguageConfig {
  code: LanguageCode;
  displayText: string;
  pathPrefix: string;
  menuTranslations: {
    gallery: string;
    artistBio: string;
    contactUs: string;
  };
}

interface DOMElements {
  switcher: HTMLElement | null;
  currentLangText: HTMLElement | null;
  menu: HTMLElement | null;
  options: NodeListOf<Element>;
  menuLinks: NodeListOf<Element>;
}

const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: "en",
    displayText: "EN",
    pathPrefix: "",
    menuTranslations: {
      gallery: "Gallery",
      artistBio: "Artist Bio",
      contactUs: "Contact us",
    },
  },
  es: {
    code: "es",
    displayText: "ES",
    pathPrefix: "/es",
    menuTranslations: {
      gallery: "Galería",
      artistBio: "Biografía de la Artista",
      contactUs: "Contáctanos",
    },
  },
};

const DEFAULT_LANGUAGE: LanguageCode = "en";

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

const MENU_KEYWORDS: Record<string, keyof LanguageConfig["menuTranslations"]> =
  {
    gallery: "gallery",
    galería: "gallery",
    bio: "artistBio",
    biografía: "artistBio",
    contact: "contactUs",
    contáctanos: "contactUs",
  };

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

function getElements(selector: string): NodeListOf<Element> {
  return document.querySelectorAll(selector);
}

function getBaseUrl(): string {
  const baseTag = document.querySelector("base");
  if (baseTag?.href) {
    try {
      const baseUrl = new URL(baseTag.href);
      return baseUrl.pathname;
    } catch (error) {
      console.warn("Failed to parse base URL from <base> tag", error);
    }
  }

  const currentPath = window.location.pathname;
  for (const pattern of BASE_URL_PATTERNS) {
    if (currentPath.includes(pattern)) {
      return pattern;
    }
  }

  return "/";
}

function normalizePath(path: string, baseUrl: string): string {
  let relativePath = path;

  if (baseUrl !== "/" && path.startsWith(baseUrl)) {
    relativePath = path.replace(baseUrl, "/");
  }

  if (!relativePath || relativePath === baseUrl || relativePath === "/") {
    return "/";
  }

  return relativePath;
}

function constructFullPath(relativePath: string, baseUrl: string): string {
  if (baseUrl === "/") {
    return relativePath;
  }

  const relative = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return `${base}${relative}`;
}

function detectLanguage(): LanguageCode {
  const path = window.location.pathname;

  for (const [code, config] of Object.entries(LANGUAGES)) {
    if (code === DEFAULT_LANGUAGE) continue;
    if (path.includes(`${config.pathPrefix}/`)) {
      return code;
    }
  }

  return DEFAULT_LANGUAGE;
}

function getLanguagePathPrefix(lang: LanguageCode): string {
  return LANGUAGES[lang]?.pathPrefix || "";
}

function convertPath(
  currentPath: string,
  targetLang: LanguageCode,
  baseUrl: string,
): string {
  const relativePath = normalizePath(currentPath, baseUrl);
  const currentLang = detectLanguage();

  if (currentLang === targetLang) {
    return currentPath;
  }

  const targetPrefix = getLanguagePathPrefix(targetLang);
  const currentPrefix = getLanguagePathPrefix(currentLang);

  let newRelativePath = relativePath;

  if (currentPrefix && relativePath.startsWith(currentPrefix)) {
    newRelativePath = relativePath.replace(currentPrefix, "");
  }

  if (targetPrefix) {
    if (newRelativePath.startsWith("/artwork/")) {
      const artworkId = newRelativePath.replace("/artwork/", "");
      newRelativePath = `${targetPrefix}/artwork/${artworkId}`;
    } else if (newRelativePath === "/") {
      newRelativePath = `${targetPrefix}/`;
    } else {
      newRelativePath = `${targetPrefix}${newRelativePath}`;
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

  private initializeElements(): DOMElements {
    return {
      switcher: getElement<HTMLElement>(SELECTORS.switcher),
      currentLangText: getElement<HTMLElement>(SELECTORS.currentLang),
      menu: getElement<HTMLElement>(SELECTORS.menu),
      options: getElements(SELECTORS.languageOption),
      menuLinks: getElements(SELECTORS.menuLink),
    };
  }

  private validateElements(): boolean {
    const { switcher, currentLangText, menu } = this.elements;
    return !!(switcher && currentLangText && menu);
  }

  private initializeState(): void {
    this.updateLanguageDisplay();
    this.translateHeaderMenu();
  }

  private updateLanguageDisplay(): void {
    const currentLang = detectLanguage();
    const config = LANGUAGES[currentLang];

    if (!config) return;

    if (this.elements.currentLangText) {
      this.elements.currentLangText.textContent = config.displayText;
    }

    this.elements.options.forEach((option) => {
      const lang = option.getAttribute("data-lang");
      if (lang === currentLang) {
        option.classList.add(SELECTORS.activeOptionClass);
      } else {
        option.classList.remove(SELECTORS.activeOptionClass);
      }
    });
  }

  private translateHeaderMenu(): void {
    const currentLang = detectLanguage();
    const config = LANGUAGES[currentLang];

    if (!config) return;

    this.elements.menuLinks.forEach((link) => {
      const text = link.textContent?.trim().toLowerCase() || "";

      for (const [keyword, translationKey] of Object.entries(MENU_KEYWORDS)) {
        if (text.includes(keyword)) {
          link.textContent = config.menuTranslations[translationKey];
          break;
        }
      }
    });
  }

  private openDropdown(): void {
    const { menu, switcher } = this.elements;
    if (!menu || !switcher) return;

    menu.classList.add(SELECTORS.openMenuClass);
    switcher.setAttribute("aria-expanded", "true");
  }

  private closeDropdown(): void {
    const { menu, switcher } = this.elements;
    if (!menu || !switcher) return;

    menu.classList.remove(SELECTORS.openMenuClass);
    switcher.setAttribute("aria-expanded", "false");
  }

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

  private switchLanguage(lang: LanguageCode): void {
    if (!LANGUAGES[lang]) return;

    const currentPath = window.location.pathname;
    const newPath = convertPath(currentPath, lang, this.baseUrl);

    if (newPath !== currentPath) {
      window.location.href = newPath;
    } else {
      this.closeDropdown();
    }
  }

  private handleLanguageOptionClick(event: Event, option: Element): void {
    event.preventDefault();
    event.stopPropagation();

    const lang = option.getAttribute("data-lang");
    if (lang && LANGUAGES[lang]) {
      this.switchLanguage(lang);
    }
  }

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

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.closeDropdown();
    }
  }

  private setupEventListeners(): void {
    const { switcher, options } = this.elements;

    switcher?.addEventListener("click", (e) => this.toggleDropdown(e));

    options.forEach((option) => {
      option.addEventListener("click", (e) =>
        this.handleLanguageOptionClick(e, option),
      );
    });

    document.addEventListener("click", (e) => this.handleOutsideClick(e));
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }
}

function initLanguageSwitcher(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      new LanguageSwitcher();
    });
  } else {
    new LanguageSwitcher();
  }
}

initLanguageSwitcher();
