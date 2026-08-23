/* =============================================================================
 * CONTENT — every Arabic string on this site lives under src/content/.
 *
 *   import { hero, story, site } from "@/content";
 *
 * NOT ONE Arabic string may be inlined in a component. The reasons are
 * practical, not stylistic:
 *   · the copy is a client's, in a language most of the squad does not read —
 *     it must be copy-pasted, diffable and reviewable in one place
 *   · a typo in a component is invisible; a typo here shows up in review
 *   · the client will send corrections, and they must land in one file
 *
 * Extracted verbatim from SOVA recon brief §5. Facts the client has NOT
 * supplied are NOT in these files — they are in `placeholders.ts`, which is the
 * only module allowed to describe something that does not exist yet.
 * ========================================================================== */

export { site, type Site } from "./site";
export { primaryNav, footerNav, type NavItem } from "./nav";
export { hero, type Hero } from "./hero";
export { trust, type Trust, type Stat } from "./trust";
export { story, type Story } from "./story";
export { regions, allRegions, cutRegionsSection, type Region } from "./regions";
export { projects, projectDetail, projectImageAlt, type Project } from "./projects";
export { interior } from "./interior";
export { units, type Units } from "./units";
export { membership } from "./membership";
export { howItWorks, type HowItWorks } from "./process";
export { location, type Location } from "./location";
export { president } from "./president";
export { faq } from "./faq";
export { contact, whatsappButton } from "./contact";
export { footer, copyrightLine } from "./footer";
export { privacy, type Privacy } from "./privacy";
export { errors, type Errors } from "./errors";
export * as placeholders from "./placeholders";
