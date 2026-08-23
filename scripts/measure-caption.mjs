// @ts-check
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* =============================================================================
 * measure-caption.mjs — prove the floor plan's caption lock, don't remember it.
 *
 *     npm run plan:caption            # against http://localhost:3300
 *     npm run plan:caption -- --url http://localhost:3000
 *     npm run plan:caption -- --keep  # leave the browser open to look at it
 *
 * =============================================================================
 * WHAT IT IS DEFENDING
 * =============================================================================
 * `<FloorPlanViewer>`'s caption is ONE `aria-live` region that swaps between an
 * idle sentence and a selected apartment's whole programme. Left to size itself
 * it changes height under the visitor's thumb: on a phone the five-row list sits
 * directly beneath it, so tapping «شقة 3» pushes «شقة 4» to where «شقة 3» just
 * was. The regions schematic shipped exactly that — a 75px jump at 320px — and
 * the fix is a min-height that clears the TALLEST state at every width.
 *
 * A lock is only as good as its last measurement, and the comment carrying those
 * numbers had no way to check them. This script is that way. It:
 *
 *   1. reads the lock out of floor-plan-viewer.tsx, so the claim under test is
 *      the code and not an argument passed in here;
 *   2. drives `/plans/d-66` in headless Edge at each width;
 *   3. releases the lock with an inline `min-height: 0` — inline beats the
 *      class, and React never rewrites a `style` it was not given — then
 *      measures the block idle and against all five apartments;
 *   4. FAILS (exit 1) if the tallest state at any width does not fit the lock
 *      that width would use.
 *
 * ⚠️ IT IS A CHECK, NOT A FORMATTER. It never edits the component. When it
 * fails it prints the smallest lock that would pass and you go and write it,
 * along with the new table, into the comment above the live region.
 *
 * =============================================================================
 * WHY EDGE OVER CDP AND NOT PLAYWRIGHT
 * =============================================================================
 * `ankaa-next` has no browser-automation dependency and is not getting one for
 * a measuring tape — Playwright is ~300MB of browsers in a repo whose entire
 * point is that it deploys small. Windows ships Edge; Node 22 ships a global
 * `WebSocket`. That is the whole toolchain.
 *
 * ⚠️ IT NEEDS A SERVER ALREADY RUNNING. `next start -p 3300`, and note that a
 * `next build` run against a live `next start` leaves it serving stale
 * manifests until it is restarted — every page then dies with a client-side
 * ChunkLoadError and this script will report a missing viewer, not a layout
 * problem. Restart the server after a build.
 * ========================================================================== */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VIEWER = path.join(ROOT, "src/components/sections/floor-plan-viewer.tsx");

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const BASE = (arg("url", "http://localhost:3300") ?? "").replace(/\/$/, "");
const KEEP = argv.includes("--keep");
const PAGE = "/plans/d-66";

/* The `sm` breakpoint is the only one the lock branches on, so the widths are
   chosen around it: the two narrowest phones still in the wild, the two common
   ones, and then just under and just over 640 plus the desktop the design was
   drawn at. Adding a width is free; removing 320 is not — it is the width the
   original bug was found at. */
const WIDTHS = [320, 360, 390, 430, 639, 640, 768, 1024, 1440];
const SM = 640;

/* -------------------------------------------------------------- the lock ---- */

/**
 * Pull `min-h-*` and `sm:min-h-*` off the caption's live region.
 *
 * ⛔ BY `data-slot="plan-caption"`, NOT BY POSITION. The attribute exists for
 * this script and for the DOM query below, and the component says so.
 */
function readLock(source) {
  const at = source.indexOf('data-slot="plan-caption"');
  if (at === -1) {
    throw new Error(
      'floor-plan-viewer.tsx has no [data-slot="plan-caption"] — the caption ' +
        "was renamed or removed. Fix this script's two handles, or delete it.",
    );
  }
  const tag = source.slice(at, source.indexOf(">", at));
  const grab = (prefix) => {
    const m = tag.match(
      new RegExp(`(?<![\\w:-])${prefix}min-h-(\\[[^\\]]+\\]|[\\w.]+)`),
    );
    return m ? m[1] : null;
  };
  return { base: grab(""), sm: grab("sm:") };
}

/** Tailwind's token → px. Bare numbers are quarter-rem rungs; `[…]` is literal. */
function toPx(token, rootPx) {
  if (!token) return 0;
  if (token.startsWith("[")) {
    const raw = token.slice(1, -1);
    if (raw.endsWith("rem")) return parseFloat(raw) * rootPx;
    if (raw.endsWith("px")) return parseFloat(raw);
    throw new Error(`unsupported min-height unit: ${raw}`);
  }
  return parseFloat(token) * 0.25 * rootPx;
}

/* ----------------------------------------------------------- the browser ---- */

const EDGE_CANDIDATES = [
  process.env.EDGE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint(port, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const targets = await (
        await fetch(`http://127.0.0.1:${port}/json/list`)
      ).json();
      const page = targets.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  return null;
}

async function launch(port) {
  const bin = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!bin) {
    throw new Error(
      "no Edge or Chrome found. Set EDGE_PATH to a browser binary, or start " +
        `one yourself with --remote-debugging-port=${port}.`,
    );
  }
  /* Its own profile, in the OS temp dir. ⛔ Never the default profile: this
     runs headless and would fight the browser the operator has open. */
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ankaa-caption-"));
  const child = spawn(
    bin,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore", detached: false },
  );
  child.unref();
  return { child, profile, bin };
}

/** Minimal CDP client. One tab, request/response by id, no event plumbing. */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("CDP socket refused"));
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  const send = (method, params = {}) => {
    const n = ++id;
    ws.send(JSON.stringify({ id: n, method, params }));
    return new Promise((resolve) => pending.set(n, resolve));
  };
  /** Evaluate in the page and throw the page's error rather than swallowing it. */
  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    const thrown =
      res.result?.exceptionDetails?.exception?.description ??
      res.result?.exceptionDetails?.text;
    if (thrown) throw new Error(`page threw: ${String(thrown).slice(0, 300)}`);
    return res.result?.result?.value;
  };
  return { ws, send, evaluate };
}

/* -------------------------------------------------------- the measurement ---- */

/* Runs inside the page. Returns the caption's NATURAL height for the current
   state, with the lock released inline.

   ⚠️ IT POLLS FOR A STABLE VALUE rather than trusting one frame. Selecting an
   apartment re-renders the programme chips and the room labels animate in; a
   single read can catch the block mid-reflow and under-report by a row. Two
   equal reads a frame apart is the cheapest honest answer. */
const MEASURE = `(async () => {
  const el = document.querySelector('[data-slot="plan-caption"]');
  if (!el) return null;
  el.style.minHeight = "0px";
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  let last = -1;
  for (let i = 0; i < 30; i++) {
    await frame();
    const h = el.getBoundingClientRect().height;
    if (Math.abs(h - last) < 0.5) return Math.ceil(h);
    last = h;
  }
  return Math.ceil(last);
})()`;

const READY = `(() => {
  const el = document.querySelector('[data-slot="plan-caption"]');
  const rows = document.querySelectorAll('button[data-apartment]');
  return el && rows.length ? rows.length : 0;
})()`;

/**
 * Click apartment `no` and DO NOT RETURN UNTIL THE COMPONENT AGREES.
 *
 * ⛔ THE `aria-pressed` CHECK IS THE WHOLE POINT, and this script's first run
 * is the proof. `<FloorPlanViewer>` server-renders all five rows, so a DOM
 * query for them succeeds long before React has attached a single handler —
 * at the first width measured, on a cold client bundle, every `.click()`
 * landed on inert markup and returned quietly. The report came back with all
 * five "selected" heights exactly equal to idle at 320px and green overall,
 * which is the worst kind of wrong: a passing check that measured nothing.
 *
 * `aria-pressed` flips only when React re-renders, so waiting on it waits on
 * hydration, on the state change, and on the paint that follows, without
 * guessing at any of them.
 */
async function select(cdp, no, want = true) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const pressed = await cdp.evaluate(
      `(() => {
        const b = document.querySelector('button[data-apartment="${no}"]');
        if (!b) return null;
        if (b.getAttribute('aria-pressed') !== '${String(want)}') b.click();
        return b.getAttribute('aria-pressed') === '${String(want)}';
      })()`,
    );
    if (pressed === null) throw new Error(`no row for apartment ${no}`);
    if (pressed) return;
    await sleep(150);
  }
  throw new Error(
    `apartment ${no} never reported aria-pressed="${want}" — the viewer is ` +
      "rendering but not hydrating. Check the browser console for a " +
      "ChunkLoadError from a build that outran its server.",
  );
}

async function main() {
  const source = fs.readFileSync(VIEWER, "utf8");
  const lock = readLock(source);

  // Fail fast and clearly rather than after launching a browser.
  const probe = await fetch(`${BASE}${PAGE}`).catch(() => null);
  if (!probe?.ok) {
    console.error(
      `\n  no server at ${BASE}${PAGE}.\n` +
        "  start one first:  npx next start -p 3300\n" +
        "  or point this at another:  npm run plan:caption -- --url <base>\n",
    );
    process.exit(2);
  }

  const port = 9222;
  let launched = null;
  let wsUrl = await endpoint(port, 1);
  if (!wsUrl) {
    launched = await launch(port);
    wsUrl = await endpoint(port);
    if (!wsUrl) throw new Error("browser started but never opened a CDP page");
  } else {
    console.log(`  reusing the browser already on :${port}`);
  }

  const cdp = await connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const rows = [];
  let rootPx = 16;

  for (const width of WIDTHS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    // A cache-buster per width: the page is static, and a bfcache restore would
    // hand back the DOM with the previous run's inline min-height still on it.
    await cdp.send("Page.navigate", { url: `${BASE}${PAGE}?w=${width}` });

    let ready = 0;
    for (let i = 0; i < 60 && ready !== 5; i++) {
      await sleep(250);
      ready = (await cdp.evaluate(READY).catch(() => 0)) || 0;
    }
    if (ready !== 5) {
      throw new Error(
        `at ${width}px the viewer never hydrated (found ${ready} of 5 ` +
          "apartment rows). Is the server serving a stale build?",
      );
    }

    rootPx =
      (await cdp.evaluate(
        `parseFloat(getComputedStyle(document.documentElement).fontSize)`,
      )) || 16;

    /* Hydration gate: press a row and release it. Idle measured before this
       is idle-shaped markup that may not yet be a live component, and every
       click after it would be a no-op — see `select`. */
    await select(cdp, 1, true);
    await select(cdp, 1, false);

    const idle = await cdp.evaluate(MEASURE);
    const states = { idle };
    for (let no = 1; no <= 5; no++) {
      await select(cdp, no, true);
      states[`apt${no}`] = await cdp.evaluate(MEASURE);
    }

    const tallest = Math.max(...Object.values(states));
    const applied = width >= SM && lock.sm ? lock.sm : lock.base;
    rows.push({ width, ...states, tallest, applied });
  }

  /* ⚠️ TEARDOWN COMES AFTER THE REPORT, NOT BEFORE IT. Closing the browser is
     the one step here that can fail for reasons that have nothing to do with
     the measurement — Edge holds its profile's SQLite files open for a moment
     after `Browser.close` returns, and an unlucky `rm` throws EBUSY. Doing it
     first threw that away a whole run's numbers once. */
  const cleanUp = async () => {
    cdp.ws.close();
    if (!launched || KEEP) return;
    await cdp.send("Browser.close").catch(() => {});
    // Give the process its exit before touching the profile, then let go of
    // the directory rather than fail a green run over a temp file.
    for (let i = 0; i < 20 && !launched.child.killed; i++) await sleep(100);
    launched.child.kill();
    for (let i = 0; i < 10; i++) {
      try {
        fs.rmSync(launched.profile, { recursive: true, force: true });
        return;
      } catch {
        await sleep(300);
      }
    }
    console.log(`  (left a temp profile behind: ${launched.profile})`);
  };

  /* ------------------------------------------------------------ the report */
  const pad = (v, n) => String(v).padStart(n);
  console.log(
    `\n  caption natural height — ${BASE}${PAGE}  (1rem = ${rootPx}px)\n`,
  );
  console.log(
    "  width   idle  apt1  apt2  apt3  apt4  apt5  | tallest   lock",
  );
  console.log("  " + "-".repeat(62));
  for (const r of rows) {
    console.log(
      `  ${pad(r.width, 5)} ${pad(r.idle, 6)}${pad(r.apt1, 6)}${pad(r.apt2, 6)}` +
        `${pad(r.apt3, 6)}${pad(r.apt4, 6)}${pad(r.apt5, 6)}  |${pad(r.tallest, 8)}` +
        `   ${r.applied}`,
    );
  }

  /* The verdict, per lock rather than per width: a lock is wrong only if the
     tallest state ACROSS the widths it governs does not fit inside it. */
  const buckets = [
    { name: "base", token: lock.base, rows: rows.filter((r) => r.width < SM) },
    {
      name: "sm:",
      token: lock.sm ?? lock.base,
      rows: rows.filter((r) => r.width >= SM),
    },
  ];

  let failed = false;
  console.log("");
  for (const b of buckets) {
    if (!b.rows.length) continue;
    const need = Math.max(...b.rows.map((r) => r.tallest));
    const have = Math.round(toPx(b.token, rootPx));
    const ok = have >= need;
    if (!ok) failed = true;
    const slack = have - need;
    console.log(
      `  ${ok ? "OK  " : "FAIL"}  ${b.name.padEnd(5)} min-h-${b.token}` +
        ` = ${have}px  vs  tallest ${need}px` +
        `  (${slack >= 0 ? "+" : ""}${slack}px)`,
    );
    if (!ok) {
      /* Quarter-rem rungs are what Tailwind's bare scale is made of, so round
         up to one rather than emitting an arbitrary pixel value. */
      const rung = Math.ceil(need / (0.25 * rootPx));
      console.log(
        `        smallest lock that fits: min-h-${rung}` +
          ` (${rung * 0.25}rem = ${rung * 0.25 * rootPx}px)`,
      );
    }
  }

  if (failed) {
    console.log(
      "\n  The caption can now grow past its lock, which means selecting an\n" +
        "  apartment moves the list underneath it. Raise the lock in\n" +
        "  src/components/sections/floor-plan-viewer.tsx and update the\n" +
        "  measured table in the comment above it with the numbers here.\n",
    );
  } else {
    console.log("\n  Lock holds at every width measured.\n");
  }

  await cleanUp();
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(`\n  measure-caption failed: ${err.message}\n`);
  process.exit(1);
});
