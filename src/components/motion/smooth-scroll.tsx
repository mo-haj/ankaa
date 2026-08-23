"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

import {
  ScrollTrigger,
  gsap,
  registerMotion,
  useReducedMotion,
} from "@/components/motion/motion-env";

/* -----------------------------------------------------------------------------
 * <SmoothScroll> — Lenis, and the handshake that makes GSAP trust it.
 *
 * KILLJOY scaffolded this and left it deliberately unmounted; NEON tuned it,
 * wired the bridge and mounted it in `src/app/layout.tsx`.
 *
 * =============================================================================
 * THE BRIDGE — three lines, and all three are load-bearing (SOVA §15.1)
 * =============================================================================
 * Lenis does not scroll the document synchronously: it interpolates a value
 * and writes a transform. ScrollTrigger, left alone, samples the native scroll
 * position on its own rAF, so every scrubbed timeline on the page lags the
 * content it is pinned to and pins jitter. The fix is to make them ONE loop:
 *
 *   lenis.on("scroll", ScrollTrigger.update)   ScrollTrigger recomputes the
 *                                              instant Lenis moves, not later.
 *   gsap.ticker.add(t => lenis.raf(t * 1000))  ONE rAF drives both. Lenis is
 *                                              constructed with autoRaf:false
 *                                              precisely so it has no loop of
 *                                              its own to fight this one.
 *                                              (gsap.ticker counts seconds,
 *                                              lenis.raf wants milliseconds.)
 *   gsap.ticker.lagSmoothing(0)                GSAP's lag smoothing rewrites
 *                                              elapsed time after a long frame.
 *                                              Harmless for a tween; on a
 *                                              scrubbed timeline it makes the
 *                                              page appear to snap. Off.
 *
 * ⚠ WHY THE BRIDGE IS ITS OWN COMPONENT AND NOT AN EFFECT UP HERE. `ReactLenis`
 * constructs its instance inside its own effect and then `setState`s it, so a
 * `ref` on it is still empty when the PARENT's effect runs (child effects fire
 * first, but the imperative handle only updates on the render that follows).
 * Reading it from the context instead means the bridge attaches on the render
 * where the instance actually exists. Getting this wrong is silent: the page
 * still scrolls, every scrubbed timeline just runs a frame behind.
 *
 * =============================================================================
 * REDUCED MOTION (SOVA §15.4) — no Lenis at all
 * =============================================================================
 * Smooth scrolling IS motion, and it is the one kind a visitor cannot escape
 * by looking away. Under `prefers-reduced-motion` this renders `null` and the
 * browser's own scrolling is used. It renders no DOM in either case — see the
 * block above `<SmoothScroll>` for why it stopped wrapping the page — so there
 * is nothing for the two paths to differ about and hydration is unaffected.
 *
 * ⚠ `autoRaf` must be passed inside `options`. The top-level `autoRaf` prop is
 * deprecated in lenis 1.3 and `options.autoRaf` wins — set it in the wrong
 * place and Lenis quietly runs its own rAF alongside gsap.ticker's, which
 * double-steps the scroll and is very hard to see in a screenshot.
 * -------------------------------------------------------------------------- */

/** SOVA §15.1's tuning, verbatim. Slower and lighter than Lenis's defaults. */
const LENIS_OPTIONS = {
  duration: 1.15,
  wheelMultiplier: 0.86,
  touchMultiplier: 1.08,
  autoRaf: false,
} as const;

function GsapLenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = () => ScrollTrigger.update();
    const raf = (time: number) => lenis.raf(time * 1000);

    /* =====================================================================
     * ⛔ THE FOURTH LINE OF THE BRIDGE — LENIS MUST RE-MEASURE TOO.
     * =====================================================================
     * OPERATOR, 2026-08-22: "the scrolling not getting to the copy right area
     * i can do it form clicking the scrolling bar not by the mouse".
     *
     * LENIS CLAMPS EVERY SCROLL TO A CACHED DOCUMENT HEIGHT. When something
     * grows the page after that measurement, the wheel stops at the OLD
     * bottom and the last N pixels of the footer become unreachable — while
     * the native scrollbar, which never goes through Lenis, still reaches
     * them. That asymmetry is the signature of this bug, and it is exactly
     * what the operator described.
     *
     * MEASURED at 1280×900, on the contact form's success state adding the
     * WhatsApp follow-up (128px):
     *
     *              document   wheel reached   real max
     *   before       12720        11820         11820   ✅
     *   after        12848        11820         11948   ❌ short by 128
     *   scrollTo()   12848        11948         11948   ✅ (the workaround)
     *
     * ⚠️ THE 128px WAS THE TRIGGER, NOT THE CAUSE, so this is NOT fixed in the
     * contact form. Every other thing on this page that changes height after
     * load — the FAQ accordion, the region filter swapping six cards for two,
     * a font swap reflowing headings, an image finishing decode — has the same
     * defect and always did. It only became visible now because this is the
     * first one that grows the page BELOW the fold, where the lost pixels are
     * the footer instead of slack nobody scrolls to.
     *
     * WHY `refreshInit` AND NOT ANOTHER ResizeObserver. `page-motion.tsx`
     * already runs one on <body>, debounced, and its header explains why it is
     * deliberately the ONE place that reacts to height changes — "there is no
     * onValueChange hook in the FAQ and no callback in the region filter:
     * those would each be a place to forget one". A second observer here would
     * be a second place to forget. Hooking the refresh Lenis's partner already
     * performs means every existing and future refresh path re-measures BOTH.
     *
     * `refreshInit`, specifically, fires BEFORE ScrollTrigger takes its
     * measurements. That ordering is the point: Lenis re-measures first, so
     * ScrollTrigger's starts and ends are computed against a scroll range that
     * is already correct. On `refresh` (which fires after) they would be built
     * against the stale limit for one cycle.
     * ================================================================== */
    const resize = () => lenis.resize();

    lenis.on("scroll", update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener("refreshInit", resize);

    // A fresh Lenis re-measures the document; ScrollTrigger must too, or every
    // trigger built before this ran keeps last frame's start/end.
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(1000, 16);
      ScrollTrigger.removeEventListener("refreshInit", resize);
    };
  }, [lenis]);

  return null;
}

/* -----------------------------------------------------------------------------
 * <ScrollRestoration> — VIPER V-2.
 *
 * =============================================================================
 * THE BUG, MEASURED
 * =============================================================================
 * `/` at 1440 → scroll to the rail (y 3074) → open a project (overlay, page
 * still at 3074) → F5 → Back:
 *
 *   step              url                    scrollY   maxY
 *   home at the rail  /                       3074     13387
 *   overlay open      /projects/firdous-1     3074     13387
 *   after reload      /projects/firdous-1     1011      1011   ← clamped
 *   after Back        /                      13387     13387   ← the footer
 *
 * Landing on `scrollY === maxY` is the signature. It is not an animation still
 * settling — stable across a 2s and an 8s window — and at 430 a plain Back from
 * `/privacy` missed too (109 / 2161 / 817 across three runs).
 *
 * WHY. The desktop pin inserts a ~10,000px `pin-spacer` in `page-motion.tsx`'s
 * layout effect, which is AFTER the browser has already restored. Every
 * browser-owned restore is therefore measured against a document that is about
 * to change height, so it clamps — to the short document's bottom, which then
 * becomes a position two-thirds down the tall one.
 *
 * ⛔ DO NOT "FIX" THIS BY SHORTENING THE PIN. VIPER's words, and they are right:
 * the pin length is the section's whole design and the race would still exist.
 *
 * =============================================================================
 * WHAT THIS DOES, AND THE FOUR RULES IT FOLLOWS
 * =============================================================================
 * Takes `history.scrollRestoration` to `"manual"` and drives it from here,
 * applying the saved position only once the document is tall enough to hold it.
 *
 *   1. IT MOUNTS ON EVERY PATH, INCLUDING REDUCED MOTION, AND IT HAS TO.
 *      `layout.tsx`'s inline guard sets `history.scrollRestoration = "manual"`
 *      before first paint — the only moment early enough, because the browser
 *      restores long before this deferred chunk arrives. That switch is not
 *      conditional, so a document with reduced motion and no restorer would
 *      simply never restore anything. Under reduced motion there is no Lenis
 *      to hand the position to (`useLenis()` returns undefined outside the
 *      provider, by design) and `window.scrollTo` is used instead.
 *   2. IT NEVER CLAMPS. If the document is still too short when the grace
 *      period expires, it abandons the restore and leaves the page where the
 *      router put it. Clamping is the bug; landing at the top is merely a miss.
 *      This is also what protects the overlay case — with a modal open the
 *      underlying `/` is still scrolled, so 3074 gets saved under the MODAL's
 *      url, and a later real load of that short page correctly refuses it.
 *   3. IT YIELDS TO A FRAGMENT. `/#projects` and `/?region=x#projects` are deep
 *      links; the anchor wins and no restore is armed.
 *   4. IT ARMS ON A HISTORY TRAVERSAL AND ON NOTHING ELSE. A forward `push`
 *      navigation is supposed to start at the top and Next already does that —
 *      re-arming there would "restore" a position the visitor never asked for.
 *      ⭐ AND NEITHER DOES A RELOAD — NEON N1, see the block below.
 *
 * =============================================================================
 * ⛔ N1 — A REFRESH IS A FRESH START, AND THAT IS WHY MOUNT DOES NOT ARM
 * =============================================================================
 * This used to call `arm()` unconditionally when the effect ran, which made a
 * reload restore its old position — the operator wants F5 to feel like opening
 * the page, not like resuming it. The mount call is gone; `popstate` is what
 * arms now, with one narrow exception below.
 *
 * ⛔ AND IT IS ONLY SAFE BECAUSE OF WHAT `popstate` COVERS HERE. MEASURED
 * (probe-nav, production build, 1440), stamping `window.__docId` to tell one
 * document from the next:
 *
 *   step                        navigation type   document
 *   1 first load of /           navigate          qfjoix
 *   2 open a project (soft)     navigate          qfjoix   same document
 *   3 F5 on /projects/firdous-1 reload            qka9nt   NEW document
 *   4 Back to /                 reload            qka9nt   ⭐ SAME document
 *
 * Step 4 is the VIPER V-2 repro's Back, and it is a SAME-DOCUMENT traversal: a
 * reload does not change the history entry's document sequence number, so the
 * entry the SPA pushed before the reload is still reachable without a new
 * document — and it fires `popstate`. The restore that keeps V-2 closed has
 * always come from `onPop`, never from the mount call. Deleting the mount call
 * therefore costs V-2 nothing, which is the only reason it could be deleted.
 *
 * THE EXCEPTION, and it is three lines: a traversal that the browser CANNOT
 * serve from the current document or from the bfcache loads a fresh one, and
 * that document gets no `popstate` at all — only `navigation.type ===
 * "back_forward"`. Arming on exactly that keeps Back working where popstate
 * cannot reach, and it is the one navigation type that is neither a reload nor
 * a fresh visit, so it cannot re-open what N1 closed.
 * -------------------------------------------------------------------------- */

/**
 * How this document came into existence. `"back_forward"` means the browser
 * built it to serve a Back/Forward — the only load that is allowed to restore.
 */
function isTraversalLoad() {
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === "back_forward";
}

/**
 * How long to wait for the pin spacer before giving up on a restore.
 *
 * 2.5s, not the 1.2s this started at. A client-side Back to `/` has to
 * re-render the route, re-mount `<PageMotion>`, rebuild the pin and refresh
 * ScrollTrigger before the document is tall enough to hold the saved position,
 * and 1.2s was measured to be short enough to miss it — the restore silently
 * abandoned and the visitor landed at the top.
 *
 * A window this long is only safe because a real scroll gesture cancels the
 * restore outright (`INTENT`), so the longest anyone can be held is until they
 * touch the page.
 */
const RESTORE_GRACE_MS = 2500;

/**
 * Events that mean "the visitor is driving now". While a restore is armed the
 * pump re-asserts the position every frame, which would fight a person trying
 * to scroll; any of these abandons it immediately and hands the page back.
 */
const INTENT = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
/** Trailing throttle on writes. One per frame is 60 sessionStorage hits a second. */
const SAVE_THROTTLE_MS = 250;

function ScrollRestoration() {
  /* ⛔ THE LENIS INSTANCE GOES IN A REF, AND THE EFFECT HAS EMPTY DEPS.
     `useLenis()` returns undefined on the first render and the instance on the
     next, so `[lenis]` deps re-ran this whole effect — and its CLEANUP calls
     `save()`, which overwrote the position it was in the middle of restoring
     with the router's scroll-to-top 0. Measured on a Back from `/privacy`: the
     restore to 2,851 fired, the effect tore down 5ms later, saved `/ = 0`, and
     the replacement effect armed from that 0 and did nothing. The tear-down
     also handed `scrollRestoration` back to `"auto"` for a frame.

     Reading through a ref keeps `apply` current without ever re-subscribing. */
  const lenis = useLenis();
  const lenisRef = useRef<ReturnType<typeof useLenis>>(undefined);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    if (!("scrollRestoration" in history)) return;

    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    // Deliberately not the hash: a fragment is a different intent (rule 3).
    const key = () => `ankaa:scroll:${location.pathname}${location.search}`;

    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
      saveTimer = undefined;
      try {
        sessionStorage.setItem(key(), String(Math.round(window.scrollY)));
      } catch {
        /* Partitioned or cookie-blocked context. Restoration is an enhancement;
           losing it is not worth an exception on every scroll frame. */
      }
    };
    const onScroll = () => {
      /* ⛔ NOT WHILE A RESTORE IS ARMED. Between arming and landing, the
         positions going past are the router's scroll-to-top and our own
         retries — saving any of them overwrites the very value being
         restored. Measured: without this, `/` came back from a failed
         restore with its saved position rewritten to the wrong number, so
         the SECOND attempt could not have succeeded either. */
      if (target !== null) return;
      if (saveTimer === undefined) saveTimer = setTimeout(save, SAVE_THROTTLE_MS);
    };

    let target: number | null = null;
    let deadline = 0;
    let frame = 0;

    const arm = () => {
      target = null;
      if (location.hash) return;
      try {
        const raw = sessionStorage.getItem(key());
        const value = raw === null ? NaN : Number(raw);
        if (Number.isFinite(value) && value > 0) target = value;
      } catch {
        target = null;
      }
      deadline = Date.now() + RESTORE_GRACE_MS;
      pump();
    };

    const apply = () => {
      if (target === null) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (max + 1 < target) {
        // The spacer is not in the document yet. Rule 2: wait, then abandon —
        // never clamp.
        if (Date.now() < deadline) return;
        target = null;
        return;
      }

      /* ⛔ `lenis.resize()` FIRST, AND IT IS THE WHOLE BUG IN ONE LINE.
         Lenis caches the document's height and clamps every `scrollTo` to it.
         After a client-side Back the cache still holds the OUTGOING page's
         height, so a restore to 2,851 was silently clamped to 1,011 — the
         previous page's `maxY`. That is the same "measured against the wrong
         document height" failure this component exists to fix, arriving from
         the other side. */
      const smooth = lenisRef.current;
      smooth?.resize();
      if (smooth) smooth.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo(0, target);

      /* Only consider it done once it LANDED. The router scrolls to top on the
         same tick as a popstate render, and a clamp can still swallow the
         call, so a write is not proof of a position. */
      if (Math.abs(window.scrollY - target) <= 2) target = null;
    };

    /* One rAF loop, running only while a restore is armed. It is what makes
       the two racing parties — the pin inflating the document, and the router
       scrolling to top — irrelevant: whoever writes last this frame, the next
       frame writes ours again, until it sticks or the grace period ends. */
    const pump = () => {
      frame = 0;
      apply();
      if (target !== null) frame = requestAnimationFrame(pump);
    };

    const onPop = () => arm();

    /** The visitor moved the page themselves. Their position wins, always. */
    const onIntent = () => {
      target = null;
    };

    /* ⛔ NOT `arm()` — N1. A reload and a first visit both start at the top;
       only a cold Back/Forward, which will never get a `popstate`, arms here.
       The whole argument is in the block above this component. */
    if (isTraversalLoad()) arm();

    /* A ScrollTrigger refresh is the exact moment the pin spacer enters the
       document, so it is worth waking for even outside the pump's window. */
    ScrollTrigger.addEventListener("refresh", apply);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    window.addEventListener("popstate", onPop);
    for (const type of INTENT) {
      window.addEventListener(type, onIntent, { passive: true });
    }

    return () => {
      ScrollTrigger.removeEventListener("refresh", apply);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("popstate", onPop);
      for (const type of INTENT) window.removeEventListener(type, onIntent);
      if (saveTimer !== undefined) clearTimeout(saveTimer);
      /* Only if nothing was mid-flight: saving during an unfinished restore is
         what the ref above exists to prevent. */
      if (target === null) save();
      target = null;
      history.scrollRestoration = previous;
    };
  }, []);

  return null;
}

/* -----------------------------------------------------------------------------
 * <FragmentLinks> — the address bar never shows a `#`.
 *
 * OPERATOR, 2026-08-22, item 18: "can we do something about the (#) in the url
 * like remove it dont let it appear but work same as they are appear".
 *
 * =============================================================================
 * WHAT IT DOES
 * =============================================================================
 * Every same-page fragment link on the site — the five header items, the five
 * footer items, the hero's scroll cue, the membership CTA, the skip link — is
 * caught here in the CAPTURE phase, scrolled by hand, and NOT allowed to touch
 * history. The URL stays `/`. Deep links that arrive WITH a hash still work:
 * the browser lands on the section as it always did and the hash is erased
 * afterwards.
 *
 * =============================================================================
 * ⛔ WHY CAPTURE, AND WHY `preventDefault` IS ENOUGH
 * =============================================================================
 * A `next/link` runs its navigation from an `onClick` prop, which React
 * dispatches from a listener on the root container during the BUBBLE phase.
 * A native listener registered on `document` with `capture: true` runs before
 * the event has even reached the anchor, so it is guaranteed to be first —
 * and `next/dist/client/link.js` bails out on `if (e.defaultPrevented) return`
 * before it calls the router. So one `preventDefault()` disarms Next, the
 * browser's own fragment navigation, and `scroll-behavior: smooth`, in one
 * line and with no patching.
 *
 * ⚠️ AND IT IS ALSO WHY `mobile-nav.tsx` NO LONGER USES `<SheetClose asChild>`
 * ON ITS LINKS. Radix composes handlers with `composeEventHandlers(theirs,
 * ours)`, which skips `ours` when `event.defaultPrevented` is true — so the
 * moment this component started preventing default, every link in the mobile
 * sheet scrolled the page correctly and left the sheet open on top of it. That
 * file now calls `setOpen(false)` from a plain `onClick`, which React runs
 * whether or not default was prevented. If you delete this component, that is
 * still correct; if you add another Radix `Close` around a fragment link, it
 * will not be.
 *
 * =============================================================================
 * ⛔ THE FOUR THINGS IT MUST NOT TOUCH
 * =============================================================================
 *   1. ANYTHING INSIDE THE PROJECT OVERLAY. `<ProjectDetailPanel>`'s CTA is
 *      `<Link href="/#contact">` and the overlay has its own `onClickCapture`
 *      that closes the panel first and navigates second — the fix for the bug
 *      the operator reported as item 9. Two of the three guards below already
 *      exclude it (its pathname is `/projects/…`, not `/`), and the explicit
 *      `closest()` test is the third, because the day someone writes a bare
 *      `#contact` in that panel the pathname test silently stops working and
 *      item 9 comes back.
 *   2. A LINK TO ANOTHER DOCUMENT. `/#about` clicked from `/privacy` or from
 *      the 404 is a real navigation; Next owns it. The arrival cleanup below
 *      takes the hash off once the landing is done.
 *   3. A MODIFIED CLICK. Ctrl/Cmd/Shift/Alt, middle button, `target`,
 *      `download` — every one of those means the visitor asked for something
 *      other than "scroll me there".
 *   4. A FRAGMENT WITH NO TARGET IN THE DOCUMENT. Left to the browser, which
 *      does the right and boring thing (nothing).
 *
 * =============================================================================
 * FOCUS — WCAG 2.4.3, AND THE REASON THE SKIP LINK STILL WORKS
 * =============================================================================
 * A native fragment navigation moves both the scroll position AND the
 * sequential-focus starting point. Preventing it throws the second half away,
 * which would break `#main` — the first focusable element on every page — for
 * exactly the keyboard visitors it exists for. So the target is given
 * `tabindex="-1"` (once, permanently, harmless) and focused with
 * `preventScroll`. Programmatic focus does not match `:focus-visible`, so no
 * ring is painted; §globals.css keys the ring on `:focus-visible` alone.
 *
 * WITH SCRIPTING OFF none of this exists and every link is an ordinary
 * fragment link that the browser handles natively, hash and all. That is the
 * correct fallback and it needs no code.
 * -------------------------------------------------------------------------- */

/** How long a deep-linked arrival is given to land before the hash is erased. */
const ARRIVAL_SETTLE_MS = 1500;

/**
 * How long a CROSS-DOCUMENT arrival may keep its hash while the target it
 * names is still not in the DOM.
 *
 * Coming from `/board` to `/#location`, the home page's RSC payload, its
 * images and its fonts all have to land before `#location` exists. Stripping
 * the hash on the ordinary 1.5s schedule would throw away the only record of
 * where the visitor asked to go, so the strip waits — but not forever, because
 * a hash naming an id that does not exist on this page must not sit in the
 * address bar for the life of the session.
 */
const ARRIVAL_GIVE_UP_MS = 6000;

/**
 * How close to the top of the viewport counts as "already there".
 *
 * The browser's own fragment navigation puts the target's top at 0 and so does
 * `goTo`, so anything within a few pixels means the landing already happened
 * and re-scrolling would be a visible twitch for no reason.
 */
const ARRIVAL_LANDED_PX = 4;

/**
 * How long to wait for an RSC navigation to actually change the document
 * before giving up and scrolling against the layout we already have.
 *
 * If the height never moves, nothing invalidated the target and the original
 * measurement was correct — so a timeout here is a normal outcome, not a
 * failure.
 */
const RSC_HEIGHT_CHANGE_MS = 1200;

/** After the height moves, how long to wait for it to stop moving. */
const RSC_SETTLE_MS = 1300;

/** Consecutive frames of an unchanged target position that count as settled. */
const RSC_SETTLE_FRAMES = 3;

function FragmentLinks() {
  const router = useRouter();
  const lenis = useLenis();
  /* The click handler is registered once, for the life of the page, but Lenis
     arrives a render later than this component does. A ref keeps the handler's
     view of it current without re-registering — the same pattern, and the same
     reason, as `lenisRef` in <ScrollRestoration> above. */
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    const strip = () => {
      if (!location.hash) return;
      history.replaceState(
        history.state,
        "",
        `${location.pathname}${location.search}`,
      );
    };

    const goTo = (el: HTMLElement) => {
      const instance = lenisRef.current;
      if (instance) {
        instance.scrollTo(el, { offset: 0 });
      } else {
        /* No Lenis: either the visitor asked for reduced motion, or this
           chunk's Lenis has not attached yet. `scroll-behavior: smooth` is on
           `html` in globals.css and is switched to `auto` under
           `prefers-reduced-motion`, so the browser picks the right one. */
        el.scrollIntoView({ block: "start" });
      }
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };

    /**
     * Scroll to `id` once an RSC navigation has finished changing the page.
     *
     * TWO PHASES, AND BOTH ARE LOAD-BEARING:
     *
     *   1. WAIT FOR THE HEIGHT TO MOVE. `router.push` is asynchronous — the
     *      DOM is untouched for several frames after it returns. A settle
     *      check alone would find the OLD layout perfectly stable and fire
     *      immediately, which is the bug this function exists to fix, with
     *      extra steps. If the height never moves inside
     *      `RSC_HEIGHT_CHANGE_MS`, nothing invalidated the target and we
     *      scroll against the layout we already had.
     *
     *   2. THEN WAIT FOR IT TO STOP. The cards land, ScrollTrigger refreshes,
     *      the pin re-inflates: the target's position moves several times
     *      across those frames. `RSC_SETTLE_FRAMES` unchanged readings is what
     *      says the relayout is over.
     *
     * The element is re-resolved by id on every tick rather than captured,
     * because an RSC swap may legitimately replace the node.
     */
    const landAfterRelayout = (id: string) => {
      const startedAt = Date.now();
      const heightAtClick = document.documentElement.scrollHeight;
      let moved = false;
      let lastTop: number | null = null;
      let steady = 0;

      const tick = () => {
        const el = document.getElementById(id);
        const elapsed = Date.now() - startedAt;

        if (!moved) {
          if (document.documentElement.scrollHeight !== heightAtClick) {
            moved = true;
          } else if (elapsed >= RSC_HEIGHT_CHANGE_MS) {
            if (el) goTo(el); // nothing relaid out; the original aim was fine
            return;
          } else {
            requestAnimationFrame(tick);
            return;
          }
        }

        if (!el) {
          if (elapsed < RSC_HEIGHT_CHANGE_MS + RSC_SETTLE_MS) {
            requestAnimationFrame(tick);
          }
          return;
        }

        const top = Math.round(el.getBoundingClientRect().top);
        steady = lastTop !== null && Math.abs(top - lastTop) < 2 ? steady + 1 : 0;
        lastTop = top;

        if (
          steady >= RSC_SETTLE_FRAMES ||
          elapsed >= RSC_HEIGHT_CHANGE_MS + RSC_SETTLE_MS
        ) {
          goTo(el);
          return;
        }
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
        "a[href]",
      );
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.closest('[data-slot="project-overlay"]')) return;

      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname !== location.pathname) return;
      if (!url.hash || url.hash === "#") return;

      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return; // a malformed escape sequence is not our fragment to resolve
      }
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();

      /* ⛔ A `?region=` ON THE SAME HREF IS A REAL NAVIGATION AND MUST GO
         THROUGH THE ROUTER. The projects filter chips are
         `/?region=firdous#projects` and the Location section's area names are
         the same shape: same pathname, same document, but a different SEARCH.
         `page.tsx` is a dynamic Server Component that reads `?region=` and
         returns a different set of cards, so the only thing that can change
         what is on screen is an RSC round trip.

         The first version of this handler rewrote the URL with
         `history.replaceState` instead. MEASURED: `location.search` became
         `?region=hama` and the rail still showed all six cards, because
         nothing had asked the server for the other five to go away. That is
         the filter silently breaking, and it would have looked like a data
         bug rather than a routing one.

         `push`, not `replace`: today a chip adds a history entry and Back
         steps through the filters you tried. `scroll: false` because the
         scroll already happened, smoothly, on the line above — App Router
         jumps to the top of the document otherwise. */
      /* =================================================================
         ⛔ SCROLL AFTER THE NAVIGATION, NOT BEFORE IT — OPERATOR, 2026-08-22
         =================================================================
         "when the project section is selected and i pressed the location
         again it does not forward me to exactly the right location … there
         is no scroll space any more so the button forwards me to كلمة رئيس
         مجلس الإدارة".

         Exactly right, and here is the arithmetic. This handler used to call
         `goTo(target)` FIRST and push the route SECOND. `goTo` resolves the
         element to a NUMBER at call time, so with the rail filtered to one
         card it aimed at the collapsed layout — and then the push restored
         six cards, the pin re-inflated, and everything below #projects moved
         DOWN underneath a scroll that had already committed.

         MEASURED at 1440×950, «الهامة» filtered, then «المناطق» in the header:

                          document   pin-spacer   #location
           filtered        11,808        521        y 5,300
           after push      13,287      2,000        y 9,680
           landed at            —          —        y 8,201   ❌

         8,201 is 1,479px short, which is exactly the spacer's delta, and it
         puts #president at the top of the viewport. The operator read the
         symptom off the screen correctly before anyone measured it.

         THE FIX IS ORDER, NOT ARITHMETIC. When the SEARCH changes this is a
         real RSC round trip that will relayout the page, so the scroll waits
         for the new document and is computed once, against it. When the
         search does NOT change, nothing is going to move and the scroll still
         happens immediately — which is every header link, the footer, the
         scroll cue and the skip link, i.e. the common path is untouched. */
      if (url.search !== location.search) {
        router.push(`${url.pathname}${url.search}`, { scroll: false });
        landAfterRelayout(id);
      } else {
        goTo(target);
      }
    };

    document.addEventListener("click", onClick, true);

    /* An arrival that already carries a hash — a shared link, a bookmark, or
       `/#about` followed from another route. The browser and the App Router
       are both still resolving it at this point (Next re-applies the hash from
       its own router state after hydration, and `location.hash` is what some
       of that path reads), so the hash is left in place until the landing is
       demonstrably over. It is a one-off timer, not a loop. */
    /* =====================================================================
       ⛔ THE HASHES THIS COMPONENT DID NOT PUT THERE — AND WHY THIS IS A
       POLL AND NOT THREE LISTENERS
       =====================================================================
       The click handler above covers every same-page link on the site. A `#`
       can still reach the address bar four other ways, and they were found one
       at a time, each by a test:

         1. A HASHED ARRIVAL. `/#contact` typed, bookmarked, or followed from
            another site. A real document load; a mount-time timer catches it.
         2. THE SAME URL WITHOUT A LOAD. `/#contact` entered while already on
            `/` is a same-document navigation: the browser scrolls, fires
            `hashchange`, and does not reload, so nothing remounts.
         3. A CROSS-DOCUMENT LINK. `/#about` clicked on `/privacy` or on the
            404 — correctly declined by guard 2 above and handled by Next.
         4. `router.push("/#contact")` FROM THE PROJECT OVERLAY. This is the
            one that defeated every event-based attempt. `closeThenNavigate()`
            calls `router.back()` FIRST (which is what takes the pathname from
            `/projects/…` to `/`) and only then pushes the hash — so by the
            time the fragment appears the pathname has ALREADY finished
            changing. A `usePathname()`-keyed effect was written for this case
            and measured doing nothing: `/#contact` sat in the URL for eight
            seconds. `pushState` fires no `hashchange` either.

       One 250ms read of `location.hash` covers all four, costs nothing
       measurable, and cannot be defeated by the order two router calls happen
       in. `ARRIVAL_SETTLE_MS` is the grace period every case gets before the
       rewrite: Next re-applies the fragment from its own router state after
       the RSC payload lands, and stripping before that would take the scroll
       with it. */
    /* =====================================================================
       ⛔ CASE 3 WAS NEVER ACTUALLY HANDLED, AND THE COMMENT ABOVE SAID IT WAS
       =====================================================================
       "A CROSS-DOCUMENT LINK … correctly declined by guard 2 above and handled
       by Next." The declining was right. The handling was not: NEXT DOES NOT
       SCROLL TO THE FRAGMENT on an App Router client-side navigation, and this
       poll then erased the hash 1.5s later — so the visitor's request was
       thrown away and they were left wherever the new page opened.

       MEASURED at 1440×950, clicking «المناطق» in the header:

         from        landed at   #location was at
         /privacy      y = 0        top 9680     ❌
         /board        y = 0        top 9680     ❌
         /  (control)  y = 9680     top 0        ✅

       i.e. EVERY header and footer section link was broken on every sub-page —
       six links × three routes — and had been since `/privacy` shipped. It
       only became easy to hit when «مجلس الإدارة» started pointing at `/board`
       on 2026-08-22, which is how the operator found it: "it drops me down to
       the location area then suddenly it went me up to كلمة رئيس مجلس
       الإدارة".

       ⛔ THE FIX IS `land()` BEFORE `strip()`, AND IT IS GATED ON A PATHNAME
       CHANGE. Landing on every hash the poll sees would fight the three cases
       that already work — a typed `/#contact`, a `hashchange` on the same
       document, and the overlay's push — and worse, it would yank back a
       visitor who deep-linked and then scrolled away during the settle window.
       `crossDoc` is only armed when the PATHNAME moved under us, which is the
       one case the browser did not scroll for.

       `goTo` is reused rather than reimplemented, so a cross-document arrival
       gets the same Lenis scroll and the same `tabindex`/`focus` treatment
       (WCAG 2.4.3) as a same-page click. That is what puts focus on the
       section instead of leaving it on <body>. */
    let hashSince = 0;
    let lastPath = location.pathname;
    let crossDoc = false;

    /** The element the current hash names, or null. */
    const fragmentTarget = () => {
      let id: string;
      try {
        id = decodeURIComponent(location.hash.slice(1));
      } catch {
        return null;
      }
      return id ? document.getElementById(id) : null;
    };

    const watch = () => {
      /* A pathname change while a hash is present is the cross-document
         arrival. Re-arm the settle timer with it: the clock should start when
         the new document appears, not when the old one was still on screen. */
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        crossDoc = true;
        hashSince = 0;
      }

      if (!location.hash) {
        hashSince = 0;
        crossDoc = false;
        return;
      }
      if (hashSince === 0) {
        hashSince = Date.now();
        return;
      }

      const waited = Date.now() - hashSince;
      if (waited < ARRIVAL_SETTLE_MS) return;

      if (crossDoc) {
        const target = fragmentTarget();
        /* Still rendering. Keep the hash — it is the only record of where the
           visitor asked to go — and try again on the next tick, up to the cap. */
        if (!target) {
          if (waited < ARRIVAL_GIVE_UP_MS) return;
        } else {
          const top = target.getBoundingClientRect().top;
          if (Math.abs(top) > ARRIVAL_LANDED_PX) goTo(target);
        }
        crossDoc = false;
      }

      strip();
      hashSince = 0;
    };
    watch();
    const poll = window.setInterval(watch, 250);

    return () => {
      document.removeEventListener("click", onClick, true);
      clearInterval(poll);
    };
    /* `router` is a stable singleton in App Router — listing it would not
       change when this runs, and both the listener and the poll must be
       registered exactly once for the life of the page. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/* -----------------------------------------------------------------------------
 * ⛔ IT RENDERS NO CHILDREN, AND THAT IS WHY IT COULD BE DEFERRED — CHAMBER C2-1.
 *
 * This was `<SmoothScrollProvider>{children}</SmoothScrollProvider>` in the root
 * layout, and wrapping the tree is exactly what made it impossible to lazy-load:
 * `next/dynamic` on a wrapper delays everything inside it. Because it wrapped,
 * its import graph — `motion-env` → gsap + ScrollTrigger + SplitText + lenis —
 * landed in the SHARED chunk group for every route. CHAMBER measured the result
 * from the shipped build, not from an estimate:
 *
 *   .next/server/app/_not-found.html   971KB raw over 15 chunks, of which
 *                                      336KB is gsap / ScrollTrigger / lenis
 *                                      — about 35% of the 404's JavaScript
 *
 * `<ReactLenis root>` attaches to the window; it does not need to be an ancestor
 * of anything. So this renders as a SIBLING of the page, its two children are
 * the null-rendering bridge and the restorer that need Lenis from context, and
 * `smooth-scroll-mount.tsx` loads the whole module with `ssr: false`.
 *
 * `SplitText` could be split one level further (CHAMBER's own suggestion: a
 * dynamic `import("gsap/SplitText")` inside the president block). It is NOT
 * done: SplitText is on the critical path of the hero headline on `/`, and on
 * every other route it now arrives in the deferred chunk anyway — so the change
 * would add two awaits to the most timing-sensitive code in the project and buy
 * nothing on any route.
 *
 * ⚠️ IF YOU EVER MAKE THIS WRAP `{children}` AGAIN, the 336KB comes back to
 * every route and nothing will fail to build.
 * -------------------------------------------------------------------------- */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  registerMotion();

  /* No Lenis, but restoration and the fragment-link handler still have an
     owner — see rule 1 above. <FragmentLinks> falls back to the browser's own
     scrolling when `useLenis()` gives it nothing, which under reduced motion
     is a jump rather than a glide, exactly as it should be. */
  if (reducedMotion) {
    return (
      <>
        <ScrollRestoration />
        <FragmentLinks />
      </>
    );
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <GsapLenisBridge />
      <ScrollRestoration />
      <FragmentLinks />
    </ReactLenis>
  );
}
