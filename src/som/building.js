// Assembles the six floors into one stacked building: shared perimeter, elevator/stair cores,
// courtyard void colliders, and world-space render data. Also exposes collide/floorAt/locate.
import { LEVELS, baseY, BOUNDS, COURTYARD, EYE, R_PLAYER, TAU } from './geo.js'
import * as F2 from '../layout.js' // Tauhid's fully detailed 2nd floor + Shen Courtyard
import buildLL from './floors/lowerLevel.js'
import buildF1 from './floors/floor1.js'
import buildF3 from './floors/floor3.js'
import buildF4 from './floors/floor4.js'
import buildF5 from './floors/floor5.js'

const { xMin, xMax, zMin, zMax } = BOUNDS
// Floor 2 (index 2) is null here: it is rendered from the detailed src/World.jsx instead, and its
// collision/lookup is delegated to src/layout.js below.
const BUILDERS = [buildLL, buildF1, null, buildF3, buildF4, buildF5]
export const DETAILED_F2 = 2

// Vertical cores (elevator/stair shafts) that repeat full-height on every floor. These are
// co-located with the building's stair cores (STAIRS in layout.js) so the elevators sit right
// where the stairwells are; the door faces the same open side as the stair.
const faceDoor = (fx, fz) => (fx > 0 ? 'E' : fx < 0 ? 'W' : fz > 0 ? 'S' : 'N')
export const CORES = F2.STAIRS.filter((s) => s.lift).map((s) => ({
  x: s.c[0],
  z: s.c[1],
  w: s.w,
  d: s.d,
  door: faceDoor(s.face[0], s.face[1]),
}))

function addCore(f, core) {
  const { x, z, w, d, door } = core
  const x0 = x - w / 2
  const x1 = x + w / 2
  const z0 = z - d / 2
  const z1 = z + d / 2
  const g = 0.9
  const edge = (side, A, B) => (door === side ? f.doorWall(A, B, 'steel', g) : f.W(A, B, 'steel'))
  edge('N', [x0, z0], [x1, z0])
  edge('S', [x0, z1], [x1, z1])
  edge('W', [x0, z0], [x0, z1])
  edge('E', [x1, z0], [x1, z1])
  f.box(x, z, w - 0.5, d - 0.5, 0.05, 'dark', 0) // cab floor
}

function addShell(f, lvl) {
  // perimeter facades (N/S/W full; E may open for an east bulge such as Zhang / Beinecke)
  f.W([xMin, zMin], [xMin, zMax], 'exterior') // west
  f.W([xMin, zMin], [xMax, zMin], 'exterior') // north
  f.W([xMin, zMax], [xMax, zMax], 'exterior') // south
  const g = f.eastGap
  if (g) {
    f.W([xMax, zMin], [xMax, g[0]], 'exterior')
    f.W([xMax, g[1]], [xMax, zMax], 'exterior')
  } else {
    f.W([xMax, zMin], [xMax, zMax], 'exterior')
  }
  for (const c of CORES) addCore(f, c)
  if (lvl.void) {
    // courtyard edge is a wall you can't cross (the glass + the drop)
    const pts = [...COURTYARD, COURTYARD[0]]
    for (let i = 0; i < pts.length - 1; i++)
      f.walls.push({ a: pts[i], b: pts[i + 1], mat: 'none', h: 4.6, y0: 0, t: 0.3, collide: true })
  }
}

// ---------- build every floor + shared shell (floor 2 is handled by the detailed module)
const FLOORS = LEVELS.map((lvl, i) => {
  if (!BUILDERS[i]) return { lvl, f: null }
  const f = BUILDERS[i]()
  addShell(f, lvl)
  return { lvl, f }
})

// ---------- world-space render data
export const WALLS_BY_MAT = {}
export const ROUNDS = []
export const SIGNS = []
export const DISCS = []
export const BOXES_BY_MAT = {}
export const CYLS = []
export const CHAIRS = []

for (const { lvl, f } of FLOORS) {
  if (!f) continue
  const y = baseY(lvl.idx)
  for (const w of f.walls) {
    if (w.mat === 'none') continue
    const dx = w.b[0] - w.a[0]
    const dz = w.b[1] - w.a[1]
    ;(WALLS_BY_MAT[w.mat] ||= []).push({
      p: [(w.a[0] + w.b[0]) / 2, y + w.y0 + w.h / 2, (w.a[1] + w.b[1]) / 2],
      r: -Math.atan2(dz, dx),
      s: [Math.max(Math.hypot(dx, dz), 0.01) + 0.02, w.h, w.t],
    })
  }
  for (const r of f.rounds) ROUNDS.push({ ...r, y })
  for (const s of f.signs) SIGNS.push({ ...s, y })
  for (const d of f.discs) DISCS.push({ ...d, y })
  for (const b of f.boxes) (BOXES_BY_MAT[b.mat] ||= []).push({ p: [b.p[0], b.p[1] + y, b.p[2]], s: b.s })
  for (const c of f.cyls) CYLS.push({ ...c, p: [c.p[0], c.p[1] + y, c.p[2]] })
  for (const c of f.chairs) CHAIRS.push({ ...c, y })
}

// ---------- colliders per level
const COLLIDERS = FLOORS.map(({ f }) =>
  !f
    ? null
    : f.walls
    .filter((w) => w.collide)
    .map((w) => ({
      a: w.a,
      b: w.b,
      t: w.t,
      minx: Math.min(w.a[0], w.b[0]),
      maxx: Math.max(w.a[0], w.b[0]),
      minz: Math.min(w.a[1], w.b[1]),
      maxz: Math.max(w.a[1], w.b[1]),
    })),
)

export function collide(pos, level) {
  if (level === DETAILED_F2) return F2.collide(pos)
  const set = COLLIDERS[level] || []
  for (let it = 0; it < 3; it++) {
    for (const s of set) {
      const rr = R_PLAYER + s.t / 2
      if (pos.x < s.minx - rr || pos.x > s.maxx + rr || pos.z < s.minz - rr || pos.z > s.maxz + rr) continue
      const dx = s.b[0] - s.a[0]
      const dz = s.b[1] - s.a[1]
      const l2 = dx * dx + dz * dz
      let u = l2 > 0 ? ((pos.x - s.a[0]) * dx + (pos.z - s.a[1]) * dz) / l2 : 0
      u = Math.max(0, Math.min(1, u))
      const qx = s.a[0] + dx * u
      const qz = s.a[1] + dz * u
      const ex = pos.x - qx
      const ez = pos.z - qz
      const d = Math.hypot(ex, ez)
      if (d < rr && d > 1e-6) {
        pos.x = qx + (ex / d) * rr
        pos.z = qz + (ez / d) * rr
      }
    }
  }
  return pos
}

export function floorAt(level) {
  return baseY(level)
}

// floor height under a point, including the classroom risers on the detailed 2nd floor
export function floorHeight(x, z, level) {
  if (level === DETAILED_F2) return baseY(2) + F2.floorAt(x, z)
  return baseY(level)
}

const LABELS = FLOORS.map(({ f }) => (f ? f.labels : null))
export function locate(x, z, level) {
  if (level === DETAILED_F2) return F2.locate(x, z)
  for (const l of LABELS[level] || []) if (l.test(x, z)) return l.name
  const lvl = LEVELS[level]
  if (lvl.void && Math.hypot(x, z) < 16) return 'Courtyard void'
  const ns = z < -24 ? 'north' : z > 24 ? 'south' : ''
  const ew = x < -22 ? 'west' : x > 18 ? 'east' : ''
  const where = [ns, ew].filter(Boolean).join('-') || 'central'
  return `${lvl.name} · ${where} cloister`
}

// is the player standing inside an elevator core?
export function inCore(x, z) {
  return CORES.some((c) => Math.abs(x - c.x) < c.w / 2 && Math.abs(z - c.z) < c.d / 2)
}

export const SPAWN = { x: -37, z: 1, level: 1 } // 1st floor, west main entrance looking into the building
export { LEVELS, baseY, EYE }
