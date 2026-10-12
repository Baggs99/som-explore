// Shared geometry + constants for the multi-floor SOM (Evans Hall) build.
// World axes: +x = east, -z = north (same convention as src/layout.js).
// Units are meters. Floor 2 is the datum at y = 0; every other level stacks off it.

export const H = 4.6 // floor-to-floor height
export const EYE = 1.65
export const R_PLAYER = 0.35
export const TAU = Math.PI * 2

// Core rectangle shared by every floor (matches the existing floor-2 footprint).
export const BOUNDS = { xMin: -40.75, xMax: 28.75, zMin: -48.3, zMax: 48.3 }
export const EAST = BOUNDS.xMax
export const WEST = BOUNDS.xMin

// Six levels, bottom to top. baseY keeps floor 2 at the origin.
export const LEVELS = [
  { id: 'LL', idx: 0, name: 'Lower Level', short: 'LL', void: false },
  { id: '1', idx: 1, name: '1st Floor', short: '1', void: true },
  { id: '2', idx: 2, name: '2nd Floor', short: '2', void: true },
  { id: '3', idx: 3, name: '3rd Floor', short: '3', void: true },
  { id: '4', idx: 4, name: '4th Floor', short: '4', void: true },
  { id: '5', idx: 5, name: '5th Floor', short: '5', void: true },
]
export const baseY = (idx) => (idx - 2) * H
export const TOP_Y = baseY(5) + H // glass roof height over the courtyard

// ---------- helpers
export const norm = (v) => {
  const l = Math.hypot(v[0], v[1]) || 1
  return [v[0] / l, v[1] / l]
}
export const ellPt = (c, rx, rz, th) => [c[0] + rx * Math.sin(th), c[1] + rz * Math.cos(th)]
export const arc = (c, rx, rz, a0, a1, n) =>
  Array.from({ length: n + 1 }, (_, i) => ellPt(c, rx, rz, a0 + ((a1 - a0) * i) / n))

export function inPoly(x, z, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i]
    const [xj, zj] = pts[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

// ---------- central courtyard: rounded square with glass wiggles on the N/S sides.
// Centered a little west of the building center, like the real plan (origin at 0,0).
function courtyardPoints(n = 192) {
  const hx = 20
  const hz = 18
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU
    const c = Math.cos(t)
    const s = Math.sin(t)
    const x = hx * Math.sign(c) * Math.pow(Math.abs(c), 1 / 3)
    let z = hz * Math.sign(s) * Math.pow(Math.abs(s), 1 / 3)
    const w = Math.pow(Math.abs(s), 6)
    z -= Math.sign(s) * w * 0.9 * (0.5 + 0.5 * Math.cos((TAU * x) / 14.5))
    pts.push([x, z])
  }
  return pts
}
export const COURTYARD = courtyardPoints()
