import { makeFloor } from '../kit.js'
import { ellPt, TAU } from '../geo.js'
import { xMin, xMax, zMin, zMax } from './shared.js'

// ---------------------------------------------------------------------------------------------
// FLOOR 1 — traced from the building's own "1 · Wayfinding & Evacuation Plan".
//
// Orientation (locked to Tauhid's detailed Floor 2 so the stack is coherent):
//   plan TOP   -> world WEST  (-x)      plan BOTTOM -> world EAST (+x)
//   plan LEFT  -> world SOUTH (+z)      plan RIGHT  -> world NORTH (-z)
//
// So: The Forum (Snyder) sits at the SW corner of the west facade, the Café at the NW corner,
// the retail/dining bar runs along the north, the suites along the south, and Zhang Auditorium
// bulges EAST directly beneath the Beinecke Terrace Room on Floor 2.
// ---------------------------------------------------------------------------------------------

const EAST = xMax

// The Forum (Snyder) — a curved glass pavilion on the WEST facade. Glass faces west (outside),
// the glossy black screen wall faces east (into the cloister), door to the north. Dark slat
// ceiling + downlights, walnut tables with black chairs, columns, bins, plants, "50 YEARS" decal.
// Scaled from the "Partial Snyder Forum Mesh" scan (~16 x 15 m, ~3.7 m ceiling) + interior photos.
function buildForum(f, cx, cz, rx, rz) {
  const HH = 3.7
  const C = [cx, cz]

  // curved shell: glossy screen wall east (~pi/2), glass elsewhere, doorway north (~pi)
  const n = 96
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU
    const a1 = ((i + 1) / n) * TAU
    const mid = (a0 + a1) / 2
    const near = (ang) => Math.abs(((mid - ang + Math.PI) % TAU) - Math.PI)
    if (near(Math.PI / 2) < 0.7) {
      f.W(ellPt(C, rx, rz, a0), ellPt(C, rx, rz, a1), 'gloss', { h: HH })
    } else if (near(Math.PI) < 0.22) {
      // doorway (north) — open
    } else {
      f.W(ellPt(C, rx, rz, a0), ellPt(C, rx, rz, a1), 'glass', { h: HH })
    }
  }

  // dropped slat ceiling + recessed downlights
  f.ceilingDisc(cx, cz, rx - 0.1, rz - 0.1, HH - 0.02, 'slatDark')
  for (let x = cx - rx + 1.2; x <= cx + rx - 1.2; x += 1.7)
    for (let z = cz - rz + 1.2; z <= cz + rz - 1.2; z += 1.7)
      if (((x - cx) / (rx - 0.6)) ** 2 + ((z - cz) / (rz - 0.6)) ** 2 < 1)
        f.box(x, z, 0.16, 0.16, 0.04, 'lamp', HH - 0.1)

  // projection screen on the glossy east wall (faces west into the room) + lectern + side table
  f.box(cx + rx - 0.5, cz, 0.12, 5.4, 2.2, 'projector', 1.1)
  f.box(cx + rx - 2.4, cz, 0.6, 0.7, 1.15, 'gloss', 0)
  f.box(cx + rx - 2.7, cz + 2.2, 0.8, 0.8, 0.95, 'projector', 0)

  // stainless bins + dracaena near the screen wall
  f.cyl(cx + rx - 2.7, cz - 3.2, 0.22, 0.72, 'steel', 0)
  f.cyl(cx + rx - 2.7, cz - 3.8, 0.22, 0.72, 'steel', 0)
  for (const [px, pz] of [[cx + rx - 3.1, cz - 4.6], [cx - rx + 3, cz + 4]]) {
    f.cyl(px, pz, 0.32, 0.5, 'dark', 0)
    f.box(px, pz, 0.95, 0.95, 1.15, 'leaf', 0.5)
  }

  // white columns
  for (const [px, pz] of [[cx - 2, cz + 1], [cx + 3, cz - 2]]) f.cyl(px, pz, 0.28, HH, 'column', 0)

  // walnut tables with black cantilever chairs, clustered toward the glass (west)
  const tables = [[cx - 3, cz + 3], [cx - 4.5, cz - 0.5], [cx - 2, cz - 2.5], [cx - 5, cz + 3.5], [cx - 1, cz + 0.5]]
  for (const [tx, tz] of tables) {
    f.cyl(tx, tz, 0.85, 0.74, 'desk', 0)
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU
      f.seat(tx + Math.sin(a) * 1.5, tz + Math.cos(a) * 1.5, a)
    }
  }

  // "50 YEARS" decal on the west glass (readable from inside)
  f.box(cx - rx + 0.4, cz, 0.05, 2.6, 1.7, 'fifty', 1.3)

  f.sign(cx, cz - rz - 0.15, Math.PI, 'Snyder Forum', '1400')
  f.label('Snyder Forum · 1400', (x, z) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2 < 1)
}

// McNay Market — NW corner grab-and-go café: curved glass, dark slat ceiling (matching the Forum
// pavilion), a chilled market display case, and high-top tables with bar stools. (photos IMG_2525)
function buildCafe(f, cx, cz, r) {
  const HH = 3.7
  f.round(cx, cz, r, { name: 'McNay Market', id: '1200', mat: 'glass', doorAng: Math.PI / 2, gap: 0.4, carpet: 'tileFloor' })
  // dropped slat ceiling + downlights
  f.ceilingDisc(cx, cz, r - 0.15, r - 0.15, HH - 0.02, 'slatDark')
  for (let x = cx - r + 1.3; x <= cx + r - 1.3; x += 1.7)
    for (let z = cz - r + 1.3; z <= cz + r - 1.3; z += 1.7)
      if ((x - cx) ** 2 + (z - cz) ** 2 < (r - 0.9) ** 2) f.box(x, z, 0.16, 0.16, 0.04, 'lamp', HH - 0.1)
  // chilled grab-and-go market case along the west wall
  f.box(cx - r + 1.7, cz, 1.1, 5.5, 1.0, 'desk', 0)
  f.box(cx - r + 1.7, cz, 0.85, 5.3, 0.55, 'glass', 1.0)
  // high-top tables with bar stools
  for (const [tx, tz] of [[cx + 1.6, cz - 3], [cx + 3, cz + 0.5], [cx + 1, cz + 3], [cx - 1.2, cz - 1.3]]) {
    f.cyl(tx, tz, 0.4, 1.05, 'desk', 0)
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.5
      f.cyl(tx + Math.sin(a) * 0.9, tz + Math.cos(a) * 0.9, 0.17, 0.75, 'dark', 0)
    }
  }
  // dracaena
  f.cyl(cx + r - 2.2, cz - 2.5, 0.32, 0.5, 'dark', 0)
  f.box(cx + r - 2.2, cz - 2.5, 0.9, 0.9, 1.1, 'leaf', 0.5)
}

// The courtyard cloister: a colonnade of white columns just outside the courtyard glass, with
// round wood-top café tables + dark-gray sled chairs on light tile. (photos IMG_2478, IMG_2481)
function buildCloister(f) {
  const nearCore = (x, z) => [[-34.75, 15.5], [-34.75, -15.5], [24.6, 25], [24.6, -25]].some((c) => Math.abs(x - c[0]) < 3 && Math.abs(z - c[1]) < 3)
  // tile the cloister walkway (kept clear of the room floors so carpets don't z-fight)
  f.carpet(-26, 18.2, 26, 24.6, 'tileFloor') // south band
  f.carpet(-26, -24.6, 26, -18.2, 'tileFloor') // north band
  f.carpet(-26.5, -18, -20, 18, 'tileFloor') // west band
  // colonnade
  for (let x = -18; x <= 18; x += 6) {
    if (!nearCore(x, 21)) f.cyl(x, 21, 0.3, 4.3, 'column', 0)
    if (!nearCore(x, -21)) f.cyl(x, -21, 0.3, 4.3, 'column', 0)
  }
  for (let z = -14; z <= 14; z += 7) f.cyl(-22.5, z, 0.3, 4.3, 'column', 0)
  // café tables (round wood top + 3 gray sled chairs)
  const tbl = (tx, tz) => {
    f.cyl(tx, tz, 0.55, 0.74, 'desk', 0)
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.4
      f.seat(tx + Math.sin(a) * 1.05, tz + Math.cos(a) * 1.05, a)
    }
  }
  for (let x = -16; x <= 16; x += 4.5) {
    if (!nearCore(x, 22.5)) tbl(x, 22.5)
    if (!nearCore(x, -22.5)) tbl(x, -22.5)
  }
}

// Zhang Auditorium — large raked auditorium bulging EAST beneath the Beinecke terrace. Its center
// is pushed east of the perimeter so its west edge clears the courtyard and leaves a walkable
// east cloister in front of the entrance.
function buildZhang(f) {
  const cx = EAST + 2.25
  const cz = 0
  const R = 8
  f.round(cx, cz, R, { name: 'Zhang Auditorium', id: '1300', mat: 'drum', doorAng: (3 * Math.PI) / 2, gap: 0.3 })
  // stage + screen at the deep (east) end
  f.box(cx + 5.8, cz, 1.6, 7, 0.6, 'dark', 0)
  f.box(cx + 6.6, cz, 0.2, 5, 3, 'screen', 1.2)
  // raked seating facing the stage (+x = east)
  for (let row = 0; row < 8; row++) {
    const xr = cx + 3.2 - row * 1.45
    for (let sz = -7.5; sz <= 7.5; sz += 1.3) {
      if (Math.hypot(xr - cx, sz) > R - 1.2) continue
      f.seat(xr, cz + sz, -Math.PI / 2, 'chairBlue')
    }
  }
}

export default function build() {
  const f = makeFloor()

  // open the east facade where Zhang bulges out
  f.eastGap = [-8, 8]

  // ---- WEST facade: The Forum (SW), Prefunction/Reception connector (center), Market (NW)
  buildForum(f, -32, 28, 7, 8)
  // Main public entrance (west facade): entrance mat, black security desk, lobby plant
  f.room(xMin + 0.8, -6, -26, 6, { name: 'Main Entrance / Reception', id: '1100', door: 'E', carpet: 'tileFloor' })
  f.carpet(xMin + 0.5, -3.2, xMin + 6, 3.2, 'dark', 0.02) // entrance mat at the glass doors (lifted above the tile floor)
  f.box(-33, 0, 2.6, 1.0, 1.1, 'dark', 0) // black reception / security desk
  f.cyl(-29, -4, 0.32, 0.5, 'dark', 0)
  f.box(-29, -4, 0.9, 0.9, 1.1, 'leaf', 0.5) // lobby plant
  buildCafe(f, -32, -28, 7)
  f.label('Wyper Gallery', (x, z) => x < -24 && z > -18 && z < 18)

  // ---- SOUTH inner suites (adjacent the courtyard, doors face north/courtyard)
  f.room(-22, 25, -12, 34, { name: 'Welcome Center', id: '1415', door: 'N' })
  f.box(-21.7, 29.5, 0.12, 6, 2.2, 'desk', 1.1) // warm wood-slat accent wall
  f.sign(-21.4, 29.5, Math.PI / 2, 'WELCOME \u00b7 Yale SOM', '')
  f.box(-14, 31.5, 2, 0.9, 0.8, 'teal', 0) // teal lounge sofa
  f.room(-11, 25, 0, 34, { name: 'Alumni Relations Suite', id: '1410', door: 'N' })
  f.room(1, 25, 12, 34, { name: 'McCance Interview Suite', id: '1421', door: 'N' })
  // Ligon-Lamsam Student Commons: the big Sol LeWitt mural wall + orange lounge + café tables
  f.room(13, 25, 24, 34, { name: 'Ligon-Lamsam Student Commons', id: '1425', door: 'N', carpet: 'tileFloor' })
  f.box(18.5, 33.8, 9, 0.12, 2.1, 'mural', 1.15) // concentric rainbow mural
  for (const [sx, sz] of [[15, 32], [22, 32]]) f.box(sx, sz, 2.2, 0.95, 0.8, 'orangeLeather', 0)
  for (const [tx, tz] of [[16, 28], [21, 28.5], [18.5, 30.5]]) {
    f.cyl(tx, tz, 0.55, 0.74, 'desk', 0)
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.4
      f.seat(tx + Math.sin(a) * 1.05, tz + Math.cos(a) * 1.05, a)
    }
  }

  // ---- SOUTH outer wing (along the south facade)
  f.room(xMin + 0.8, 37, -24, 47, { name: 'Donaldson Dean\u2019s Suite', id: '1500', door: 'N' })
  f.room(-23, 37, -14, 47, { name: 'Swensen Recruiters Lounge', id: '1520', door: 'N' })
  f.room(-13, 37, -3, 47, { name: 'Bekenstein Atrium', id: '1570', door: 'N' })
  f.room(-2, 37, 8, 47, { name: 'Career Development Suite', id: '1530', door: 'N' })
  f.room(9, 37, 26, 47, { name: 'Student Lounge \u00b7 Bass Study', id: '1440', door: 'N' })
  // Student Lounge: glass merch display case, foosball table, black leather lounge chairs (IMG_2471)
  f.box(17.5, 46.4, 11, 0.6, 0.6, 'dark', 0) // display cabinet base
  f.box(17.5, 46.4, 10.6, 0.5, 1.0, 'glass', 0.6) // glass vitrine of SOM gear
  f.box(13.5, 43, 1.5, 0.9, 0.5, 'dark', 0.4) // foosball table body
  f.box(13.5, 43, 1.4, 0.85, 0.05, 'leaf', 0.9) // green play field
  for (const [sx, sz] of [[20, 43], [23, 44.2]]) f.box(sx, sz, 1.3, 1.0, 0.8, 'dark', 0) // leather chairs

  // ---- NORTH inner dining (adjacent the courtyard, doors face south/courtyard)
  // Charley's Place: a servery counter (warm-wood front + white top) under a "Charley's Place" sign,
  // with blue digital menu boards; Poorvu / Dining with white tables + dark chairs on tile.
  f.room(-22, -34, -10, -25, { name: 'Charley\u2019s Place', id: '1220', door: 'S', carpet: 'tileFloor' })
  f.box(-16, -32.6, 10, 1.3, 1.0, 'desk', 0) // servery base
  f.box(-16, -32.6, 10, 1.1, 0.08, 'white', 1.0) // servery top
  f.box(-16, -33.6, 4, 0.1, 1.0, 'menu', 1.6) // blue menu board on the back wall
  f.sign(-16, -33.9, Math.PI, 'Charley\u2019s Place', '')
  f.room(-9, -34, 4, -25, { name: 'Poorvu Dining', id: '1225', door: 'S', carpet: 'tileFloor' })
  // Commons 1210: a flexible commons — square Sol LeWitt prints over a wood bench, with blue
  // folding banquet tables + white folding chairs (IMG_2536/2537)
  f.room(5, -34, 16, -25, { name: 'Commons', id: '1210', door: 'S', carpet: 'tileFloor' })
  f.box(10.5, -33.85, 10, 0.08, 0.9, 'desk', 0) // wood wainscot bench
  for (let x = 6.5; x <= 15; x += 2.3) f.box(x, -33.8, 1.7, 0.08, 1.6, 'muralSq', 1.4) // framed prints
  for (const tz of [-31.5, -28]) for (const tx of [7.5, 11, 14.5]) {
    f.box(tx, tz, 1.9, 0.8, 0.74, 'chairBlue', 0) // blue folding banquet table
    f.seat(tx, tz + 1.0, 0, 'white')
    f.seat(tx, tz - 1.0, Math.PI, 'white')
  }
  f.cyl(6, -26.5, 0.32, 0.5, 'dark', 0)
  f.box(6, -26.5, 0.9, 0.9, 1.1, 'leaf', 0.5) // plant
  // white dining tables with dark sled chairs across Poorvu
  const diner = (tx, tz) => {
    f.box(tx, tz, 1.5, 0.85, 0.74, 'white', 0)
    f.seat(tx, tz + 1.0, 0)
    f.seat(tx, tz - 1.0, Math.PI)
  }
  for (const tz of [-31, -28.5]) for (const tx of [-7, -4, -1, 2]) diner(tx, tz)

  // ---- NORTH outer wing (retail kitchen + retail/study rooms along the north facade)
  f.room(xMin + 0.8, -47, -24, -37, { name: 'Retail Kitchen', id: '1260', door: 'S' })
  f.room(-23, -47, -12, -37, { name: 'Wyper Gallery (North)', id: '1200', door: 'S' })
  f.room(-11, -47, 2, -37, { name: 'Retail / Study', id: '1251-1269', door: 'S' })
  f.room(14, -47, 26, -37, { name: 'Service', id: '1240', door: 'S' })

  // ---- EAST: Zhang Auditorium + Wong Patios
  buildZhang(f)
  f.label('Wong Patio South', (x, z) => x > 20 && z > 11 && z < 22)
  f.label('Wong Patio North', (x, z) => x > 20 && z < -11 && z > -22)

  // ---- courtyard cloister: colonnade + café tables on tile
  buildCloister(f)

  return f
}
