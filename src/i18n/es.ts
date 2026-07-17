const year = () => new Date().getFullYear();

const contact = {
  footerContactTitle: "Contáctanos",
  footerContactLabelEmail: "Email",
  footerContactLabelAddress: "Dirección",
  footerContactAddress: "Madrid, España",
  footerSocialText: "Sígueme en Instagram",
} as const;

export const home = {
  viewAllWorksLabel: "Ver las obras",
  mobileHeroTagline: "Lápiz sobre papel",
  artistBioTitle: "Biografía de la Artista",
  artistBioText: `Nacida y criada en Ucrania, comencé a dibujar a una edad temprana y he
    continuado desarrollando mi práctica desde entonces. Aunque mi título
    es en arquitectura, soy una artista autodidacta especializada en
    dibujos a lápiz altamente detallados. Mi trabajo se centra
    principalmente en personajes femeninos, explorando temas de identidad,
    aspiración y la búsqueda de la belleza ideal. A menudo marcados por
    proporciones ligeramente exageradas, mis dibujos equilibran la
    elegancia con elementos sutiles de lo grotesco, creando un lenguaje
    visual distintivo. Desde que me mudé a Madrid en 2022, he continuado
    expandiendo mi práctica, produciendo obras intrincadas y precisas que
    reflejan tanto la expresión personal como la disciplina técnica.`,
  mobileGalleryBridgeLead: "Explora toda la colección",
  mobileGalleryBridgeLabel: "Ver Galería",
  footerTitle: "Envíanos un mensaje",
  footerFormNamePlaceholder: "Nombre",
  footerFormEmailPlaceholder: "Email",
  footerFormMessagePlaceholder: "Mensaje",
  footerFormButtonText: "Enviar",
  footerFormSendingText: "Enviando...",
  footerFormSuccessMessage: "¡Éxito! Tu mensaje ha sido enviado.",
  footerFormErrorMessage: "Error",
  footerFormErrorGeneric: "Algo salió mal. Por favor, inténtalo de nuevo.",
  ...contact,
  footerCopyright: `© ${year()} Galería. Todos los derechos reservados.`,
} as const;

export const gallery = {
  galleryTitle: "Galería",
  galleryDescriptionLine1: "Colección de arte contemporáneo",
  galleryDescriptionLine2: "De una joven artista ucraniana",
  freedomCollectionTitle: "Colección Libertad",
  allPaintingCollectionTitle: "Colección de Todas las Pinturas",
  ...contact,
  footerCopyright: `© ${year()} Galería. Todos los derechos reservados.`,
  scrollToTopLabel: "Volver arriba",
} as const;

export const artwork = {
  additionalDetailsTitle: "Detalles de la Obra",
  footerTitle: "Sobre la galería",
  footerText:
    "Explora la visión artística y el viaje creativo a través de cada pieza de la colección.",
  footerLinkText: "Ver Galería",
  footerContactTitle: "Contáctanos",
  footerContactText:
    "Sígueme y si tienes alguna pregunta, estaré encantada de contestarte.",
  footerCopyright: `© ${year()} Galería de Artista. Todos los derechos reservados.`,
} as const;
