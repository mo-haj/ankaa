/* -----------------------------------------------------------------------------
 * The @modal slot's fallback.
 *
 * Next.js renders this whenever the slot has no match — i.e. on every route
 * that is not an intercepted project, and after a hard navigation or refresh
 * (where the interception does not apply and the real page renders instead).
 * Without this file those cases 404 rather than simply showing no overlay.
 * -------------------------------------------------------------------------- */
export default function ModalDefault() {
  return null;
}
