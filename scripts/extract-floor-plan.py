"""
=============================================================================
GENERATOR - src/content/floor-plan.generated.ts FROM THE ARCHITECT'S CAD FILE
=============================================================================

INPUT   source-assets/Residential_complex/art66.dxf   (63 MB ASCII DXF,
        AC1018, converted by the operator from art66.dwg on 2026-08-22)
OUTPUT  src/content/floor-plan.generated.ts

|X| THE OUTPUT IS GENERATED. EDIT THIS SCRIPT, NEVER THE .ts FILE.

WHAT IT READS, AND WHY THAT IS THE HONEST SOURCE
------------------------------------------------
Block `rr2` in the DXF is the typical floor plate - the drawing the architect
titled "the ground and typical floor plan". It is one of four identical copies
(`rr2`, `fdd`, `fdee`, `ggg`) stamped into all 50 apartment-allocation sheets
in this file, so it is the version bound into the association's own paperwork,
not a sketch.

/!\ THE FILE ALSO CONTAINS LATER STUDY VARIANTS (around x > 90000) CARRYING
THE ARCHITECT'S OWN CRITIQUE NOTES - one says the salon has no window or light
opening, two more propose deleting a bedroom and relocating a bathroom. Those
are internal working notes. This script does not read that region, and none of
it is published anywhere on the site. If a later revision supersedes `rr2`,
that is a change for the association to communicate, not for a script to
infer from a draft it happened to find.

UNITS ARE CENTIMETRES, ESTABLISHED TWICE
----------------------------------------
`$INSUNITS` says 4 (millimetres) and is WRONG - the converter wrote it. The
DIMENSION entities read 15, 17, 24 and 30 for wall thicknesses and 327-483 for
room spans; both are centimetres (a 15 mm wall does not exist). Independently:
the plate measures 2997 x 2299 drawing units, and the five apartments the
sheets declare sum to 614 m2. 29.97 m x 22.99 m = 689 m2 gross, leaving 75 m2
for the corridor, stair, shafts and walls. Both methods agree on centimetres.

HOW THE FIVE APARTMENTS ARE FOUND (no hand-drawn regions anywhere)
------------------------------------------------------------------
1. Flatten the block to primitives, rasterise the wall layers at 1 px = 1 cm.
2. Rasterise again WITH windows, and with every door DRAWN SHUT, so each
   room becomes closed at its own threshold.
3. Connected components of the free space = atomic rooms.
4. A door's own geometry is (walls+doors) minus (walls). Each such blob that
   touches exactly two rooms is an EDGE between them.
5. Drop the exterior and the public corridor, then take connected components
   of that graph. Five fall out, and nothing else above 50 m2.
6. Grow each apartment to the wall centrelines with a distance transform, so
   the tinted regions tile the plate instead of overlapping along the walls.

THE AREAS ARE THE ARCHITECT'S, NOT THE RASTER'S
-----------------------------------------------
Flood fill measures NET clear floor. The sheets declare 114/118/120/125/137,
which are gross. The ratios come out 0.858-0.890, a normal wall allowance, and
the assignment is confirmed three independent ways: rank order, proximity to
the architect's own area callouts, and the orientation recorded in each of the
50 title blocks. `AREA_BY_APT` is transcribed from those title blocks.

|X| NOTHING IN THE OUTPUT IS A MEASUREMENT THIS SCRIPT INVENTED. The script
raises rather than guesses if the apartment count or the area assignment comes
out any other way - see the two SystemExit calls below. A silent fallback here
would put a fabricated area on a real cooperative's website.

Run:  python scripts/extract-floor-plan.py
=============================================================================
"""

import collections
import io
import json
import math
import os
import sys

import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw

import ezdxf
from ezdxf.tools.text import plain_mtext

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DXF = os.path.join(ROOT, "source-assets", "Residential_complex", "art66.dxf")
JSON_OUT = os.path.join(HERE, "floor-plan.json")
TS_OUT = os.path.join(ROOT, "src", "content", "floor-plan.generated.ts")

PLAN_BLOCK = "rr2"

# Layers that stop a flood fill on their own.
WALL_LAYERS = {"A-WALL", "S-COLS", "A-WALL-PATT", "seing", "A-FLOR-HRAL", "0"}
# Layers that only close an opening (doors, windows).
#
# `A-DOOR-SHUT` IS NOT IN THE DXF. It is the door leaf in its closed position,
# synthesised in main() from the swing arc, and it replaces that arc as the
# thing which seals a doorway. See the note there - it is the difference
# between a room owning its own floor and owning a bite of its neighbour's.
SHUT_LAYER = "A-DOOR-SHUT"
OPENING_LAYERS = {
    "A-DOOR", "A-DOOR-FRAM", "A-DOOR-GLAZ",
    "A-GLAZ", "A-GLAZ-SILL", SHUT_LAYER,
}

# /!\ `A-DOOR-OPNG` IS NOT IN THAT SET AND MUST NOT GO BACK IN. Its name reads
# like door openings; its contents are 18 lines forming exactly SIX ARROWS -
# two 10 cm barbs and a 30 cm shaft each - the symbol for which way a sliding
# door runs. Pure annotation. As a barrier it drew six arrows in solid wall
# colour, floating in the middle of six rooms. The sliding doors themselves are
# closed by `A-DOOR-GLAZ`, which is still in the set.
# What actually gets drawn, and as what.
DRAW_WALL = {"A-WALL", "S-COLS"}
DRAW_STAIR = {"seing", "A-FLOR-HRAL"}
DRAW_GLAZ = {"A-GLAZ", "A-GLAZ-SILL"}
DRAW_DOOR = {"A-DOOR", "A-DOOR-FRAM", "A-DOOR-OPNG", "A-DOOR-GLAZ"}

# Transcribed from the 50 title blocks. Apartment number -> the fields the
# architect actually filled in. `typical` is the declared area on the nine
# ground+typical sheets; `basement` and `garden` are the same field plus the
# attached-garden area on the five basement sheets.
AREA_BY_APT = {
    1: {"orient": "جنوبية غربية", "typical": 114, "basement": 80, "garden": 105},
    2: {"orient": "غربية", "typical": 120, "basement": 100, "garden": 136},
    3: {"orient": "شمالية غربية", "typical": 118, "basement": 84, "garden": 315},
    4: {"orient": "شمالية شرقية", "typical": 137, "basement": 96, "garden": 358},
    5: {"orient": "جنوبية شرقية", "typical": 125, "basement": 90, "garden": 133},
}

# The area callouts the architect placed beside the plate, transcribed from
# modelspace and expressed in the coordinates of the `rr2` instance at
# (41501, 38953). Used ONLY to confirm the assignment the flood fill already
# produced - see the SystemExit in main().
#
# /!\ 137 AND 125 WERE TRANSPOSED HERE ON THE FIRST WRITING, AND THE CHECK IS
# WHAT FOUND IT. Net-area rank said the top-left apartment was the 137; the
# transposed callouts said 125; main() refused to emit. The DXF has 137m2 at
# (41226, 39828) and 125m2 at (42712, 39812), which is the order below. That
# is the entire reason two independent methods are run instead of one.
CALLOUTS = {137: (-275, 875), 125: (1211, 859), 118: (-1161, -374),
            120: (225, -1678), 114: (1635, -1669)}

SCALE = 1.0     # px per cm

# /!\ PAD IS LOAD-BEARING AND 8 WAS A BUG. The raster is cropped to the outer
# wall, so a thin margin gets pinched off at the slanted east edge and the
# exterior stops being ONE connected cell. The fragments are then no longer
# equal to `exterior`, a window plug happily bridges a room to the fragment
# beside it, and that fragment joins the apartment's component - which put
# apartment 4 at 131.9 m2 against a declared 137 (ratio 0.963, where every
# other apartment sits near 0.88). 60 cm keeps the ring continuous.
PAD = 60


def log(*a):
    print(*a, file=sys.stderr)


# --------------------------------------------------------------- flatten CAD
def flatten(block):
    """Explode the block to primitives, in block coordinates.

    Arcs stay arcs so the door swings can be emitted as SVG `A` commands
    rather than as dozens of line segments each.
    """
    lines, arcs, texts = [], [], []

    def walk(e, depth=0):
        t = e.dxftype()
        layer = e.dxf.layer
        if t == "LINE":
            s, en = e.dxf.start, e.dxf.end
            lines.append((s[0], s[1], en[0], en[1], layer))
        elif t == "LWPOLYLINE":
            pts = [(p[0], p[1]) for p in e.get_points()]
            for i in range(len(pts) - 1):
                lines.append((pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], layer))
            if e.closed and len(pts) > 2:
                lines.append((pts[-1][0], pts[-1][1], pts[0][0], pts[0][1], layer))
        elif t == "ARC":
            c = e.dxf.center
            arcs.append((c[0], c[1], e.dxf.radius,
                         e.dxf.start_angle, e.dxf.end_angle, layer))
        elif t == "MTEXT":
            txt = " ".join(plain_mtext(e.text, split=False).split())
            if txt:
                texts.append((e.dxf.insert[0], e.dxf.insert[1], txt))
        elif t == "INSERT" and depth < 4:
            try:
                for ve in e.virtual_entities():
                    walk(ve, depth + 1)
            except Exception:
                pass

    for e in block:
        walk(e)
    return lines, arcs, texts


def arc_points(cx, cy, r, a0, a1, step=0.25):
    a0r, a1r = math.radians(a0), math.radians(a1)
    if a1r < a0r:
        a1r += 2 * math.pi
    n = max(3, int((a1r - a0r) / step))
    return [(cx + r * math.cos(a0r + (a1r - a0r) * i / n),
             cy + r * math.sin(a0r + (a1r - a0r) * i / n)) for i in range(n + 1)]


# -------------------------------------------------------------- contour trace
# Clockwise in image coordinates (y grows downward): W, NW, N, NE, E, SE, S, SW.
_NBR = [(0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1)]


def trace(mask):
    """Moore-neighbourhood boundary of the largest blob in `mask`.

    |X| THIS TRACKS THE BACKTRACK PIXEL, NOT A DIRECTION INDEX. The first
    version carried `d`, the direction it last moved, and resumed the search at
    `d + 5`. That is only equivalent to Moore tracing when the step was
    orthogonal; on a diagonal step it resumes one slot early, the walk cuts
    across the corner instead of following the edge, and it re-enters the start
    pixel after three moves. Every apartment came out as a 6-point contour that
    Douglas-Peucker then flattened to a 2-point line. Keep the backtrack pixel.
    """
    lab, n = ndimage.label(mask)
    if n == 0:
        return []
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    m = ndimage.binary_fill_holes(lab == int(sizes.argmax()))
    # A one-pixel background border, so a blob touching the raster edge still
    # has a boundary on that side and the start pixel always has a west
    # neighbour to back-track from.
    m = np.pad(m, 1)
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return []
    sy = int(ys.min())
    sx = int(xs[ys == sy].min())
    H, W = m.shape

    def solid(p):
        y, x = p
        return 0 <= y < H and 0 <= x < W and m[y, x]

    start = (sy, sx)
    p = start
    back = (sy, sx - 1)          # background by construction of the start pixel
    out = [(sx - 1, sy - 1)]     # undo the pad
    limit = 4 * int(m.sum()) + 64
    for _ in range(limit):
        idx = _NBR.index((back[0] - p[0], back[1] - p[1]))
        moved = False
        for k in range(1, 9):
            cand = (p[0] + _NBR[(idx + k) % 8][0], p[1] + _NBR[(idx + k) % 8][1])
            if solid(cand):
                back = (p[0] + _NBR[(idx + k - 1) % 8][0],
                        p[1] + _NBR[(idx + k - 1) % 8][1])
                p = cand
                out.append((p[1] - 1, p[0] - 1))
                moved = True
                break
        if not moved:
            break
        if p == start:
            break
    return out


# ------------------------------------------------------------- splitting a cell
# The smallest core an eroded room part may shrink to before it stops counting
# as a room. A برندا can be 4 m2 and its core well under 1 m2, so this is low.
CORE_MIN = 3000          # px = 0.3 m2 at 1 px per cm


def split_at_necks(mask, seeds):
    """Divide one cell between several room labels, cutting where the drawing
    narrows - not half-way between the two words.

    A cell holds more than one label when the architect drew an opening with no
    door in it: a salon continuous with its hall, a balcony off a living room.
    The tone and the label both have to say where one ends and the next begins.

    |X| THE FIRST VERSION ASKED THE TEXT WHERE THE ROOM ENDED, AND THE TEXT DOES
    NOT KNOW. It assigned each pixel to the nearest insert point, so the border
    between two parts was the perpendicular bisector of two MTEXT anchors - a
    straight diagonal whose angle depended on where the architect happened to
    park two words. In a hairline drawing nothing showed. Filled, it is a
    diagonal seam ruled across the middle of a room, and it is invented
    geometry of exactly the kind the rest of this script refuses to produce.

    So the cut comes from the plan instead. `dt` is the distance from every
    pixel to the nearest wall, so `dt >= r` is the cell eroded by r - and as r
    grows, the parts let go of each other at their narrowest connection, which
    is the opening the architect drew. The first r at which every label owns a
    distinct core is the answer; each core is then grown back over the whole
    cell, so the seam lands in the opening and runs across it, the way a
    threshold does.

    The insert points are used ONLY to say which core is whose - a job they can
    do, being reliably inside their own room - and never to decide an angle.

    Returns an int array shaped like `mask`: 0 outside, 1..len(seeds) inside.
    """
    k = len(seeds)
    if k == 1:
        return mask.astype(np.int16)
    sl = ndimage.find_objects(mask.astype(np.int8))[0]
    sub = mask[sl]
    oy, ox = sl[0].start, sl[1].start
    pts = [(sx - ox, sy - oy) for sx, sy in seeds]
    dt = ndimage.distance_transform_edt(sub)
    marker = None
    for r in range(2, int(dt.max()) + 1, 2):
        lab, n = ndimage.label(dt >= r)
        if n < k:
            continue
        sizes = np.bincount(lab.ravel(), minlength=n + 1)
        sizes[0] = 0
        big = [i for i in range(1, n + 1) if sizes[i] >= CORE_MIN]
        if len(big) < k:
            continue
        # |X| EACH LABEL PICKS ITS CORE. NEVER EACH CORE ITS LABEL, AND THE
        # DIFFERENCE IS NOT COSMETIC. Asking every core which label is nearest
        # lets a core claim a word that is standing inside a different core:
        # apartment 4 has «صالون» written inside the tall room on its east side
        # and «موزع» written further down the same room, and the corridor spur
        # off it - narrow, no door, one cell - was nearer to the salon's
        # anchor than the salon's own core was to it. The plan came out with a
        # 28 m² موزع and a 9 m² صالون, which is not a flat anybody has ever
        # built. Read the other way round the word cannot leave the room it is
        # written in, which is the only thing the drawing actually asserts.
        coords = {i: np.nonzero(lab == i) for i in big}
        pick = []
        for sx, sy in pts:
            pick.append(min(
                big,
                key=lambda i: ((coords[i][1] - sx) ** 2
                               + (coords[i][0] - sy) ** 2).min()))
        # Two labels reaching for one core means the drawing has not come apart
        # there yet. Erode further.
        if len(set(pick)) == k:
            marker = np.zeros(sub.shape, np.int16)
            for j, core in enumerate(pick, start=1):
                marker[lab == core] = j
            break
    if marker is None:
        # Nothing ever separated - two words in one undivided room. Fall back
        # to the bisector rather than dropping a label, and say so.
        log("  /!\ cell never separates at any erosion; %d labels split on the "
            "bisector" % k)
        ys_, xs_ = np.nonzero(sub)
        who = np.stack([(xs_ - sx) ** 2 + (ys_ - sy) ** 2 for sx, sy in pts]).argmin(0)
        out = np.zeros(sub.shape, np.int16)
        out[ys_, xs_] = who + 1
    else:
        # Cores no label picked - an elbow that let go early - are unmarked and
        # get swept up by whichever marked core is nearest, along with the rest
        # of the cell.
        _, (iy, ix) = ndimage.distance_transform_edt(marker == 0, return_indices=True)
        out = np.where(sub, np.where(marker > 0, marker, marker[iy, ix]), 0)

    # |X| THE INVARIANT: A WORD ENDS UP IN ITS OWN PART. It is the one thing the
    # architect actually wrote down about this cell, it is what the picking
    # direction above is there to guarantee, and it is cheap to prove rather
    # than assume. The Voronoi fallback satisfies it by construction, so
    # falling back is always a safe answer to a violation - but never a quiet
    # one, because it means the geometry did something this function does not
    # understand.
    for j, (sx, sy) in enumerate(pts, start=1):
        if out[int(round(sy)), int(round(sx))] != j:
            log("  /!\\ label %d landed outside its own part; reverting this "
                "cell to the bisector" % j)
            ys_, xs_ = np.nonzero(sub)
            who = np.stack(
                [(xs_ - sx2) ** 2 + (ys_ - sy2) ** 2 for sx2, sy2 in pts]).argmin(0)
            out = np.zeros(sub.shape, np.int16)
            out[ys_, xs_] = who + 1
            break

    full = np.zeros(mask.shape, np.int16)
    full[sl] = out
    return full


def rdp(pts, eps):
    """Douglas-Peucker, iterative so a 10k-point contour cannot blow the stack."""
    if len(pts) < 3:
        return list(pts)
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i0, i1 = stack.pop()
        if i1 <= i0 + 1:
            continue
        ax, ay = pts[i0]
        bx, by = pts[i1]
        dx, dy = bx - ax, by - ay
        den = math.hypot(dx, dy)
        best, bi = -1.0, i0
        for i in range(i0 + 1, i1):
            px, py = pts[i]
            dist = (abs(dx * (ay - py) - (ax - px) * dy) / den) if den else math.hypot(px - ax, py - ay)
            if dist > best:
                best, bi = dist, i
        if best > eps:
            keep[bi] = True
            stack.append((i0, bi))
            stack.append((bi, i1))
    return [p for p, k in zip(pts, keep) if k]


def main():
    log("reading", DXF)
    doc = ezdxf.readfile(DXF)
    block = doc.blocks[PLAN_BLOCK]
    lines, arcs, texts = flatten(block)
    log("primitives: %d lines, %d arcs, %d texts" % (len(lines), len(arcs), len(texts)))

    # ---- the door leaf, drawn shut
    #
    # |X| A SWING ARC IS FURNITURE, NOT A PARTITION, AND LETTING IT SEAL A
    # DOORWAY GIVES ROOMS EACH OTHER'S FLOOR. The arc runs from the open leaf
    # tip across to the closed one, so it seals the room it swings INTO while
    # leaving the swing area connected, through the open doorway, to the room
    # on the far side. Every door therefore handed a ~0.6 m2 lens of one room's
    # floor to its neighbour, and once the plan is filled rather than drawn in
    # hairlines that lens is plainly visible: the corridor tone bulging through
    # a bedroom door in the shape of the swing.
    #
    # The leaf is hinged at the arc's centre and the arc's radius is the clear
    # width, so the two radii ARE the leaf at the two ends of its travel: one
    # standing open into the room (which the DXF already draws as a LINE), one
    # lying across the opening. Rasterising both closes each doorway at its own
    # threshold and encloses nothing, so the swing area stays in the room it
    # belongs to. The open radius is a slit with a free end and cannot cut a
    # region in two.
    #
    # This changes only the SEGMENTATION. The arc is still what gets drawn -
    # `path_arcs(DRAW_DOOR)` reads `arcs`, untouched, so the published plan
    # still shows every swing.
    shut = []
    for cx, cy, r, a0, a1, L in arcs:
        if L not in DRAW_DOOR:
            continue
        for a in (a0, a1):
            t = math.radians(a)
            shut.append((cx, cy, cx + r * math.cos(t), cy + r * math.sin(t), SHUT_LAYER))
    lines += shut
    raster_arcs = [a for a in arcs if a[5] not in DRAW_DOOR]
    log("door swings: %d arcs -> %d shut-leaf segments" % (len(shut) // 2, len(shut)))

    # ---- building extent from the structure only, not from stray geometry
    wx, wy = [], []
    for x1, y1, x2, y2, L in lines:
        if L in DRAW_WALL:
            wx += [x1, x2]
            wy += [y1, y2]
    X0, X1 = min(wx), max(wx)
    Y0, Y1 = min(wy), max(wy)
    log("plate %.0f x %.0f cm" % (X1 - X0, Y1 - Y0))

    W = int((X1 - X0) * SCALE) + 2 * PAD
    H = int((Y1 - Y0) * SCALE) + 2 * PAD

    def to_px(x, y):
        return (PAD + (x - X0) * SCALE, PAD + (Y1 - y) * SCALE)

    def raster(layers, width=3):
        im = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(im)
        for x1, y1, x2, y2, L in lines:
            if L in layers:
                d.line([to_px(x1, y1), to_px(x2, y2)], fill=255, width=width)
        # `raster_arcs` and not `arcs`: the swing arcs are excluded above and
        # stand in as their two leaf positions instead.
        for cx, cy, r, a0, a1, L in raster_arcs:
            if L in layers:
                d.line([to_px(px, py) for px, py in arc_points(cx, cy, r, a0, a1)],
                       fill=255, width=width)
        return np.array(im) > 0

    walls = raster(WALL_LAYERS)
    closed = raster(WALL_LAYERS | OPENING_LAYERS)
    plug = closed & ~walls

    # ---- a second segmentation, in which a stair tread is not a wall
    #
    # |X| A TREAD IS NOT A PARTITION, FOR THE SAME REASON A SWING IS NOT. The
    # stair layers stop a flood fill, so 24 treads cut one flight into 24
    # slivers of about 0.5 m2 - every one under the threshold, so the whole
    # stair came out painted as solid wall, a black slab in the middle of the
    # plan. The treads cannot simply leave WALL_LAYERS: the same two layers
    # carry the balcony railings, which DO have to stop a fill or a balcony
    # runs out into the garden and takes the exterior cell with it.
    #
    # So they are dropped from a second segmentation used for ONE thing - the
    # unlabelled circulation, which is where the stairs are - and everything it
    # produces is clipped to the interior of the first, so nothing can escape
    # the building through a railing. Rooms are never read from it.
    ocells, _ = ndimage.label(~raster((WALL_LAYERS - DRAW_STAIR) | OPENING_LAYERS))

    cells, ncell = ndimage.label(~closed)
    counts = np.bincount(cells.ravel(), minlength=ncell + 1)
    areas = counts / (SCALE ** 2) / 10000.0
    sig = {int(c) for c in np.where(areas > 1.0)[0] if c}
    log("cells %d, significant %d" % (ncell, len(sig)))

    rooms_of = collections.defaultdict(list)
    for tx, ty, txt in texts:
        px, py = to_px(tx, ty)
        if 0 <= int(py) < H and 0 <= int(px) < W:
            c = int(cells[int(py), int(px)])
            if c:
                rooms_of[c].append((txt, tx, ty))

    # ---- where a room label actually goes
    #
    # /!\ THE CAD INSERT POINT IS NOT THE MIDDLE OF THE LABEL. All 42 MTEXTs
    # use attachment point 1 (top-left) with a 1414 cm column, so the point the
    # DXF stores is the top-left corner of a text box roughly 100 x 44 cm. A
    # web label centred on that point therefore sits up and to the left of
    # where the architect put it, and «صالون» in apartment 4 landed on a wall.
    #
    # Every insert point is inside its room - the segmentation proved that, no
    # label fell on a wall - so the point is a reliable ROOM IDENTIFIER even
    # though it is a poor ANCHOR. So: identify the room from the insert point,
    # then place the label at that room's centre of mass, which is where a
    # label belongs on any plan and cannot collide with the walls that define
    # it.
    # A cell holding several labels is one open space the architect named in
    # parts - a salon continuous with its hall, a balcony with no door between
    # it and the room. `split_at_necks` divides it at the opening the drawing
    # actually narrows to, and the same division is used twice: once here to
    # centre each word in the part it names, and once below to tone that part.
    # ONE split, so a room's word and a room's colour cannot disagree.
    part_id = np.zeros(cells.shape, np.int16)
    part_of, pid_of = [], {}
    for cell, entries in sorted(rooms_of.items()):
        who = split_at_necks(cells == cell, [to_px(tx, ty) for _, tx, ty in entries])
        for i, (txt, _, _) in enumerate(entries):
            part_of.append((cell, i, txt))
            pid_of[(cell, i)] = len(part_of)
            part_id[who == i + 1] = len(part_of)
    log("room parts: %d in %d labelled cells" % (len(part_of), len(rooms_of)))

    label_pos = {}
    for pid, (cell, i, txt) in enumerate(part_of, start=1):
        ys_, xs_ = np.nonzero(part_id == pid)
        if len(xs_) == 0:
            label_pos[(cell, i)] = rooms_of[cell][i][1:]
            continue
        cx, cy = xs_.mean(), ys_.mean()
        # A centre of mass can fall outside an L-shaped part. Snap to the
        # nearest pixel that is actually in it rather than trusting it.
        if part_id[int(round(cy)), int(round(cx))] != pid:
            j = np.argmin((xs_ - cx) ** 2 + (ys_ - cy) ** 2)
            cx, cy = xs_[j], ys_[j]
        label_pos[(cell, i)] = (X0 + (cx - PAD) / SCALE, Y1 - (cy - PAD) / SCALE)

    pl, npl = ndimage.label(plug, structure=np.ones((3, 3)))
    edges = set()
    for i, sl in enumerate(ndimage.find_objects(pl), start=1):
        ys_, xs_ = sl
        y0, y1_ = max(0, ys_.start - 3), min(H, ys_.stop + 3)
        x0, x1_ = max(0, xs_.start - 3), min(W, xs_.stop + 3)
        sub = pl[y0:y1_, x0:x1_] == i
        dil = ndimage.binary_dilation(sub, np.ones((7, 7)))
        nb = {int(v) for v in np.unique(cells[y0:y1_, x0:x1_][dil])} & sig
        if len(nb) == 2:
            a, b = sorted(nb)
            edges.add((a, b))

    exterior = int(cells[1, 1])
    inside = [c for c in sig if c != exterior and c not in rooms_of]
    corridor = max(inside, key=lambda c: areas[c])
    log("exterior cell %d (%.0f m2), corridor cell %d (%.1f m2)"
        % (exterior, areas[exterior], corridor, areas[corridor]))

    nodes = sig - {exterior, corridor}
    adj = collections.defaultdict(set)
    for a, b in edges:
        if a in nodes and b in nodes:
            adj[a].add(b)
            adj[b].add(a)
    seen, groups = set(), []
    for n in sorted(nodes):
        if n in seen:
            continue
        st, comp = [n], []
        seen.add(n)
        while st:
            v = st.pop()
            comp.append(v)
            for w in adj[v]:
                if w not in seen:
                    seen.add(w)
                    st.append(w)
        if sum(areas[c] for c in comp) > 50:
            groups.append(sorted(comp))
    if len(groups) != 5:
        raise SystemExit("expected 5 apartments, found %d" % len(groups))
    log("apartments (net m2): %s" % [round(sum(areas[c] for c in g), 1) for g in groups])

    # ---- assign the architect's stated areas, and CHECK it two ways
    cent = []
    for g in groups:
        cy, cx = ndimage.center_of_mass(np.isin(cells, g))
        cent.append((X0 + (cx - PAD) / SCALE, Y1 - (cy - PAD) / SCALE))
    by_rank = sorted(range(5), key=lambda i: -sum(areas[c] for c in groups[i]))
    rank_area = dict(zip(by_rank, [137, 125, 120, 118, 114]))
    prox_area = {}
    for i, (gx, gy) in enumerate(cent):
        prox_area[i] = min(
            CALLOUTS,
            key=lambda a: (gx - CALLOUTS[a][0]) ** 2 + (gy - CALLOUTS[a][1]) ** 2)
    if rank_area != prox_area or len(set(prox_area.values())) != 5:
        raise SystemExit("area assignment disagrees: rank=%s prox=%s"
                         % (rank_area, prox_area))
    log("area assignment agrees: net-area rank == callout proximity")
    apt_no = {f["typical"]: n for n, f in AREA_BY_APT.items()}

    # ---- grow each apartment to the wall centrelines so the tints tile
    seedimg = np.zeros((H, W), np.int32)
    for i, g in enumerate(groups, start=1):
        seedimg[np.isin(cells, g)] = i
    blocked = np.isin(cells, [exterior, corridor])
    dist, (iy, ix) = ndimage.distance_transform_edt(seedimg == 0, return_indices=True)
    grown = np.where((dist <= 14) & ~blocked, seedimg[iy, ix], seedimg)

    # ------------------------------------------------------------------ emit
    def fx(x):
        return round((x - X0) * 10) / 10

    def fy(y):
        return round((Y1 - y) * 10) / 10

    def num(v):
        s = ("%.1f" % v)
        return s[:-2] if s.endswith(".0") else s

    # Window sills and door frames legitimately overhang the wall line by a few
    # centimetres, so the plate is not a hard clip. 40 cm of tolerance keeps
    # those and drops the strays: the DXF carries door blocks belonging to
    # neighbouring sheets, one of which lands at x = -710, nearly 7 m clear of
    # the building, and would otherwise stretch the SVG viewBox to fit nothing.
    MARGIN = 40
    PW, PH = X1 - X0, Y1 - Y0

    def inside(x, y):
        return -MARGIN <= x <= PW + MARGIN and -MARGIN <= y <= PH + MARGIN

    def path_lines(layers):
        """Chain touching segments so `M` is emitted once per polyline."""
        segs = []
        for x1, y1, x2, y2, L in lines:
            if L in layers:
                a, b = (fx(x1), fy(y1)), (fx(x2), fy(y2))
                if a != b and (inside(*a) or inside(*b)):
                    segs.append((a, b))
        touch = collections.defaultdict(list)
        for a, b in segs:
            touch[a].append(b)
            touch[b].append(a)
        used = set()
        out = []
        for a, b in segs:
            if (a, b) in used or (b, a) in used:
                continue
            used.add((a, b))
            chain = [a, b]
            while True:
                tail = chain[-1]
                nxt = [p for p in touch[tail]
                       if (tail, p) not in used and (p, tail) not in used]
                if len(nxt) != 1:
                    break
                used.add((tail, nxt[0]))
                chain.append(nxt[0])
            # Drop collinear intermediate points. CAD splits a single wall face
            # into a segment per opening, per junction and per hatch boundary,
            # so a straight 6 m wall can arrive as nine collinear pieces. This
            # is exact to 0.5 cm - it removes vertices, never geometry.
            chain = rdp(chain, 0.5)
            d = "M" + num(chain[0][0]) + " " + num(chain[0][1])
            for p in chain[1:]:
                d += "L" + num(p[0]) + " " + num(p[1])
            out.append(d)
        return "".join(out)

    def path_arcs(layers):
        out = []
        for cx, cy, r, a0, a1, L in arcs:
            if L not in layers or r < 20:
                continue
            p = arc_points(cx, cy, r, a0, a1)
            s, e = p[0], p[-1]
            if not (inside(fx(s[0]), fy(s[1])) and inside(fx(e[0]), fy(e[1]))):
                continue
            span = (a1 - a0) % 360
            large = 1 if span > 180 else 0
            # DXF arcs run counter-clockwise; the y-flip makes that clockwise.
            out.append("M%s %sA%s %s 0 %d 1 %s %s" % (
                num(fx(s[0])), num(fy(s[1])), num(r), num(r), large,
                num(fx(e[0])), num(fy(e[1]))))
        return "".join(out)

    # ---------------------------------------------------------------- spaces
    #
    # THE WALLS ARE DRAWN AS THE GROUND, NOT AS LINES. The footprint is filled
    # once in the wall colour and every room is painted on top of it, so what
    # is left showing between the rooms IS the wall - poché, the way a plan is
    # presented to somebody who is not an architect. It also costs far less
    # than tracing the wall network itself, which is one multiply-connected
    # blob with ~50 holes in it.
    #
    # The room TYPE comes from the architect's own label, never from the shape:
    # a 4 m² cell is not a bathroom because it is small, it is a bathroom
    # because the drawing says حمام. Unlabelled interior space - corridor,
    # stair, shafts - is `core` and is toned as circulation, not as a room.
    ROOM_TYPE = {
        "نوم": "bed", "غرفة": "bed",
        "صالون": "living", "معيشة": "living",
        "مطبخ": "kitchen",
        "حمام": "bath",
        "موزع": "hall",
        "برندا": "balcony",
        "منور": "void",
    }
    interior = ~np.isin(cells, [exterior])
    foot = trace(interior)
    foot = rdp([(float(x), float(y)) for x, y in foot], 3.0)
    footprint = "M" + "L".join(
        num((x - PAD) / SCALE) + " " + num((y - PAD) / SCALE) for x, y in foot) + "Z"

    apt_of_cell = {}
    for i, g in enumerate(groups):
        for c in g:
            apt_of_cell[c] = apt_no[rank_area[i]]

    def space_path(mask, eps=2.5, floor=1500):
        """Every blob in `mask` as one path, largest first.

        |X| `trace()` RETURNS THE LARGEST BLOB AND ONLY THAT, so handing it a
        mask in several pieces silently drops all but one - which cost ~4 m2 of
        floor across the plate, every loss showing up as a wedge of bare wall
        colour inside a room. Split parts routinely arrive in pieces: an
        L-shaped salon lets go of its elbow, a hall reaches around a corner.
        Anything under `floor` px (0.15 m2) is a tracing sliver rather than a
        piece of room, and is left out on purpose.
        """
        # A 3x3 closing before tracing. The barriers are rastered three
        # pixels wide, so this cannot bridge one - it only fills the one-pixel
        # nicks a Moore trace turns into needle-thin spikes of bare wall colour
        # standing up inside a room.
        mask = ndimage.binary_closing(mask, np.ones((3, 3)))
        lab, n = ndimage.label(mask)
        if n == 0:
            return None
        sizes = np.bincount(lab.ravel())
        sizes[0] = 0
        out = []
        for i in np.argsort(sizes)[::-1]:
            if sizes[i] < floor:
                break
            contour = trace(lab == i)
            if len(contour) < 4:
                continue
            contour = rdp([(float(x), float(y)) for x, y in contour], eps)
            if len(contour) < 4:
                continue
            out.append("M" + "L".join(
                num((x - PAD) / SCALE) + " " + num((y - PAD) / SCALE)
                for x, y in contour) + "Z")
        return "".join(out) or None

    # A cell the architect named in parts is TONED in parts. A balcony
    # continuous with its living room is still outdoors, and painting it oak
    # because it shares a cell with one would be the drawing telling a small
    # lie about where the building stops. `part_id` is the division the labels
    # already use, so the tone and the word it belongs to cannot disagree.
    spaces, core_done = [], set()
    for c in sorted(sig):
        if c == exterior or areas[c] < 1.5:
            continue
        apt = apt_of_cell.get(c, 0)
        entries = rooms_of.get(c, [])
        if not entries:
            # Unlabelled: corridor, stair, shafts. Read from `ocells` so a
            # flight arrives whole, clipped to the interior so a railing-only
            # edge cannot let it out, and deduped because several cells of the
            # first segmentation collapse into one of the second.
            ys_, xs_ = np.nonzero(cells == c)
            o = int(np.bincount(ocells[ys_, xs_]).argmax())
            if o in core_done:
                continue
            core_done.add(o)
            d = space_path((ocells == o) & (cells != exterior))
            if d:
                spaces.append({"kind": "core", "apt": apt, "d": d})
            continue
        for i, (txt, _, _) in enumerate(entries):
            d = space_path(part_id == pid_of[(c, i)])
            if d:
                spaces.append({"kind": ROOM_TYPE.get(txt, "hall"), "apt": apt, "d": d})

    apts = []
    for i, g in enumerate(groups):
        area = rank_area[i]
        no = apt_no[area]
        mask = grown == (i + 1)
        contour = trace(mask)
        contour = rdp([(float(x), float(y)) for x, y in contour], 3.0)
        d = "M" + "L".join(
            num((x - PAD) / SCALE) + " " + num((y - PAD) / SCALE) for x, y in contour) + "Z"
        rl = []
        for cell in g:
            for i, (txt, tx, ty) in enumerate(rooms_of.get(cell, [])):
                lx, ly = label_pos[(cell, i)]
                rl.append({"name": txt, "x": fx(lx), "y": fy(ly)})
        ys, xs = np.nonzero(mask)
        apts.append({
            "no": no,
            "area": area,
            "orientation": AREA_BY_APT[no]["orient"],
            "basementArea": AREA_BY_APT[no]["basement"],
            "gardenArea": AREA_BY_APT[no]["garden"],
            "netArea": round(sum(areas[c] for c in g), 1),
            "d": d,
            "bbox": [round(float((xs.min() - PAD) / SCALE)),
                     round(float((ys.min() - PAD) / SCALE)),
                     round(float((xs.max() - xs.min()) / SCALE)),
                     round(float((ys.max() - ys.min()) / SCALE))],
            "rooms": sorted(rl, key=lambda r: (r["y"], r["x"])),
        })
    apts.sort(key=lambda a: a["no"])

    data = {
        "block": PLAN_BLOCK,
        "width": round(X1 - X0),
        "height": round(Y1 - Y0),
        "footprint": footprint,
        "spaces": spaces,
        "walls": path_lines(DRAW_WALL),
        "stair": path_lines(DRAW_STAIR),
        "glazing": path_lines(DRAW_GLAZ),
        "doors": path_arcs(DRAW_DOOR),
        "apartments": apts,
    }
    for k in ("walls", "stair", "glazing", "doors"):
        log("  %-8s %6d chars" % (k, len(data[k])))
    log("  regions  %6d chars" % sum(len(a["d"]) for a in apts))
    log("  rooms    %6d labels" % sum(len(a["rooms"]) for a in apts))
    with io.open(JSON_OUT, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False)
    log("wrote " + JSON_OUT)
    emit_ts(data)
    log("wrote " + TS_OUT)


TS_HEADER = '''/* =============================================================================
 * GENERATED FILE - DO NOT EDIT.
 *
 * Written by `scripts/extract-floor-plan.py` from
 * `source-assets/Residential_complex/art66.dxf`, the association's own
 * AutoCAD file for plot D-66. Re-run that script to regenerate; every number
 * and every path below traces to a drawn entity in the DXF.
 *
 * Coordinates are CENTIMETRES with y increasing downward, so the whole module
 * drops into an SVG `viewBox="0 0 {W} {H}"` untransformed. The plate is
 * {W} x {H} cm.
 *
 * |X| NORTH POINTS TO THE DRAWING'S LEFT (-x), NOT UP. That is not a guess:
 * the architect recorded an orientation in each of the 50 title blocks, and
 * the five of them agree with the five plan positions on exactly one compass
 * rotation. The apartment centred on the bottom edge is recorded as WEST, so
 * down is west, up is east, and left is north - which then makes top-left NE,
 * top-right SE, bottom-left NW and bottom-right SW, matching all four
 * remaining records. Anything that draws a compass here must use that.
 *
 * `area` is the architect's declared figure. `netArea` is what the flood fill
 * measured inside the partitions, kept so the two can be compared but NEVER
 * shown as the apartment's size - the declared figure is the one the
 * association allocates against.
 * ========================================================================== */

export interface PlanRoom {
  /** The architect's own Arabic label, verbatim from the drawing. */
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

export interface PlanApartment {
  /** الشقة رقم, as numbered in the allocation sheets. */
  readonly no: number;
  /** المساحة الفعلية on the nine ground + typical floor sheets, in m². */
  readonly area: number;
  /** المساحة الفعلية on the five basement sheets, in m². */
  readonly basementArea: number;
  /** مساحة الحديقة الملحقة - basement level only, in m². */
  readonly gardenArea: number;
  /** الاتجاه, verbatim from the title block. */
  readonly orientation: string;
  /** Measured net floor inside the partitions. Diagnostic only - see above. */
  readonly netArea: number;
  /** Region outline, traced from the segmentation. */
  readonly d: string;
  /** [x, y, width, height] in cm - the zoom target for this apartment. */
  readonly bbox: readonly [number, number, number, number];
  readonly rooms: readonly PlanRoom[];
}

/**
 * A single enclosed space. `kind` is derived from the ARCHITECT'S OWN LABEL,
 * never from the shape - a 4 m² cell is a bathroom because the drawing says
 * حمام, not because it is small. `core` is unlabelled interior space: the
 * corridor, the stair, the shafts.
 */
export interface PlanSpace {
  readonly kind:
    | "bed"
    | "living"
    | "kitchen"
    | "bath"
    | "hall"
    | "balcony"
    | "void"
    | "core";
  /** Apartment number, or 0 for shared circulation. */
  readonly apt: number;
  readonly d: string;
}

export interface FloorPlan {
  /** The DXF block this came from. */
  readonly block: string;
  readonly width: number;
  readonly height: number;
  /**
   * The whole slab outline.
   *
   * |X| THE WALLS ARE THIS SHAPE MINUS THE SPACES. Fill the footprint in the
   * wall colour, paint every `space` on top, and what still shows between them
   * IS the wall - poché, the way a plan is drawn for somebody who does not
   * read construction documents. There is no separate wall polygon and there
   * does not need to be one.
   */
  readonly footprint: string;
  readonly spaces: readonly PlanSpace[];
  /** Structure: walls and columns. */
  readonly walls: string;
  /** The stair flight and its handrail. */
  readonly stair: string;
  /** Window openings. */
  readonly glazing: string;
  /** Door swings, as arcs. */
  readonly doors: string;
  readonly apartments: readonly PlanApartment[];
}
'''


def emit_ts(data):
    def q(s):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'

    lines = [TS_HEADER.replace("{W}", str(data["width"])).replace("{H}", str(data["height"]))]
    lines.append("\nexport const floorPlan: FloorPlan = {")
    lines.append("  block: %s," % q(data["block"]))
    lines.append("  width: %d," % data["width"])
    lines.append("  height: %d," % data["height"])
    for k in ("footprint", "walls", "stair", "glazing", "doors"):
        lines.append("  %s:\n    %s," % (k, q(data[k])))
    lines.append("  spaces: [")
    for s in data["spaces"]:
        lines.append("    { kind: %s, apt: %d, d: %s }," % (q(s["kind"]), s["apt"], q(s["d"])))
    lines.append("  ],")
    lines.append("  apartments: [")
    for a in data["apartments"]:
        lines.append("    {")
        lines.append("      no: %d," % a["no"])
        lines.append("      area: %d," % a["area"])
        lines.append("      basementArea: %d," % a["basementArea"])
        lines.append("      gardenArea: %d," % a["gardenArea"])
        lines.append("      orientation: %s," % q(a["orientation"]))
        lines.append("      netArea: %s," % a["netArea"])
        lines.append("      bbox: [%s]," % ", ".join(str(v) for v in a["bbox"]))
        lines.append("      d:\n        %s," % q(a["d"]))
        lines.append("      rooms: [")
        for r in a["rooms"]:
            lines.append("        { name: %s, x: %s, y: %s },"
                         % (q(r["name"]), r["x"], r["y"]))
        lines.append("      ],")
        lines.append("    },")
    lines.append("  ],")
    lines.append("};\n")
    with io.open(TS_OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines))


if __name__ == "__main__":
    main()
