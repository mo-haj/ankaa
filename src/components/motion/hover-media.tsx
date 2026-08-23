"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { useReducedMotion } from "@/components/motion/motion-env";

/* -----------------------------------------------------------------------------
 * <HoverMedia> — the project card's image scale on hover. Framer's territory:
 * pointer-driven, so no ScrollTrigger goes anywhere near it (SOVA §15.1,
 * §15.3 "Project card hover").
 *
 * WHY A WRAPPER AND NOT A CLIENT <ProjectCard>. The obvious move — mark
 * `project-card.tsx` `"use client"` and make its root a `motion.li` — would
 * push six projects' worth of titles, regions, stages and area ranges across
 * the client boundary for a 4% scale. This takes `children` instead, so the
 * <Image> and every string around it stay server-rendered markup passing
 * through; the only thing that ships is this file.
 *
 * ⛔ HIT-TESTING IS THE WHOLE TRICK, AND IT IS WHY THE SIBLINGS ARE
 * `pointer-events-none`. This element is the media layer at the BOTTOM of the
 * card's stack; the scrim and the caption block sit on top of it. Framer's
 * `whileHover` is pointer-enter/leave on THIS element, so without opting the
 * layers above out of hit-testing the image would scale over the photograph
 * and stop scaling the moment the cursor crossed the title. Neither sibling
 * contains anything interactive — the whole card is one <Link> — so making
 * them transparent to the pointer costs nothing and the <Link> still receives
 * every event by bubbling.
 *
 * `(pointer: fine)` only (SOVA §15.3). On a touch screen `pointerenter` fires
 * on tap and then never leaves, so the card would stay scaled after the
 * visitor had moved on. Under reduced motion it does not attach at all.
 *
 * OWNERSHIP: this replaces the CSS transition wave 2 shipped on
 * `[data-project-image]` — JETT's own note says to delete those utilities if
 * Framer takes the hover over, because CSS and Framer must not both drive
 * `transform`. They are deleted.
 * -------------------------------------------------------------------------- */

/** 0.9s on `--ease-out-quart`, per SOVA §15.3. */
const TRANSITION = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;

export function HoverMedia({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setFine(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const enabled = fine && !reduced;

  return (
    <motion.div
      data-slot="hover-media"
      className={className}
      whileHover={enabled ? { scale: 1.04 } : undefined}
      transition={TRANSITION}
    >
      {children}
    </motion.div>
  );
}
