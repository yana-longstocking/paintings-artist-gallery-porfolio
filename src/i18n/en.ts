const year = () => new Date().getFullYear();

const contact = {
  footerContactTitle: "Contact Us",
  footerContactLabelEmail: "Email",
  footerContactLabelAddress: "Address",
  footerContactAddress: "Madrid, Spain",
  footerSocialText: "Follow me on Instagram",
} as const;

export const home = {
  viewAllWorksLabel: "View all works",
  mobileHeroTagline: "Pencil on paper",
  artistBioTitle: "Artist Bio",
  artistBioText: `Born and raised in Ukraine, I began drawing at an early age and have
    continued to develop my practice ever since. While my degree is in
    architecture, I am a self-taught artist specializing in highly
    detailed pencil drawings. My work focuses primarily on female
    characters, exploring themes of identity, aspiration, and the pursuit
    of ideal beauty. Often marked by slightly exaggerated proportions, my
    drawings balance elegance with subtle elements of the grotesque,
    creating a distinct visual language. Since relocating to Madrid in
    2022, I have continued to expand my practice, producing intricate and
    precise works that reflect both personal expression and technical
    discipline.`,
  mobileGalleryBridgeLead: "Explore the full collection",
  mobileGalleryBridgeLabel: "View Gallery",
  footerTitle: "Send us a message",
  footerFormNamePlaceholder: "Name",
  footerFormEmailPlaceholder: "Email",
  footerFormMessagePlaceholder: "Message",
  footerFormButtonText: "Send",
  footerFormSendingText: "Sending...",
  footerFormSuccessMessage: "Success! Your message has been sent.",
  footerFormErrorMessage: "Error",
  footerFormErrorGeneric: "Something went wrong. Please try again.",
  ...contact,
  footerCopyright: `© ${year()} Gallery. All rights reserved.`,
} as const;

export const gallery = {
  galleryTitle: "Gallery",
  galleryDescriptionLine1: "Contemporary art collection",
  galleryDescriptionLine2: "Featuring a young ukrainian artist",
  freedomCollectionTitle: "Freedom Collection",
  allPaintingCollectionTitle: "All Painting Collection",
  ...contact,
  footerCopyright: `© ${year()} Gallery. All rights reserved.`,
  scrollToTopLabel: "Back to top",
} as const;

export const artwork = {
  additionalDetailsTitle: "Artwork Details",
  footerTitle: "About the Gallery",
  footerText:
    "Explore the unique artistic vision and creative journey through each piece in the collection.",
  footerLinkText: "View Gallery",
  footerContactTitle: "Contact us",
  footerContactText:
    "Follow me and if you have any questions, I am here for you.",
  footerCopyright: `© ${year()} Artist Gallery. All rights reserved.`,
  scrollToTopLabel: "Back to top",
} as const;
