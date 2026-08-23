/* -----------------------------------------------------------------------------
 * Layout + typography primitives — ASTRA.
 *
 *   import { Section, Container, SectionHeader, Accent } from "@/components/layout";
 *
 * The whole system in one sentence: <Section theme="dark"> swaps the ground
 * tokens, everything inside it — including the gold accent — becomes correct
 * for that ground, and nothing else needs a prop.
 * -------------------------------------------------------------------------- */
export { Container, type ContainerProps } from "./container";
export { Section, Ground, type SectionProps } from "./section";
export { SectionHeader, type SectionHeaderProps } from "./section-header";
export { Accent, Display, Lead, Label, Prose } from "./typography";
