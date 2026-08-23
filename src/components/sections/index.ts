/* -----------------------------------------------------------------------------
 * SECTIONS — one file per section of the page, composed in src/app/page.tsx.
 *
 * Wave 1 (JETT): hero, trust strip, story.
 * Wave 2 (JETT): projects (+ rail, card, detail panel, overlay), unit types,
 *                interior. The project detail is a ROUTE, not a section — see
 *                src/app/projects/[slug]/ and src/app/@modal/.
 * Wave 3 (JETT): how-it-works (`projectDetail.steps` promoted out of the
 *                modal), membership (split — conditions only), president,
 *                location, FAQ, contact (+ the enquiry form, the one client
 *                island of the wave). Plus the SEO layer in src/app/.
 * -------------------------------------------------------------------------- */
export { Hero } from "./hero";
export {
  HeroBlueprint,
  BLUEPRINT_GRID,
  BLUEPRINT_BUILDING,
  BLUEPRINT_VIEWBOX,
} from "./hero-blueprint";
export { TrustStrip } from "./trust-strip";
export { Story } from "./story";
export { Projects, type ProjectsProps } from "./projects";
export { ProjectCard, type ProjectCardProps } from "./project-card";
export { ProjectsRail } from "./projects-rail";
export {
  ProjectDetailPanel,
  type ProjectDetailPanelProps,
} from "./project-detail-panel";
export { ProjectOverlay } from "./project-overlay";
export { UnitTypes, UNIT_TYPES_ENABLED } from "./unit-types";
export { Interior, INTERIOR_ENABLED } from "./interior";
export { HowItWorks } from "./process";
export { Membership } from "./membership";
export { President } from "./president";
export { LocationSection, LOCATION_ENABLED } from "./location";
export { Faq } from "./faq";
export { Contact } from "./contact";
export { ContactForm } from "./contact-form";
