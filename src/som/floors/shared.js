// Positions reused across floors so rooms stack sensibly (classrooms over classrooms, etc.)
import { BOUNDS } from '../geo.js'

// Eight classroom "pods" ringing the courtyard — same spots on floors 2 and 4.
export const PODS = [
  { c: [14.5, -31.4], r: 6 },
  { c: [0, -31.4], r: 6 },
  { c: [-14.5, -31.4], r: 6 },
  { c: [-31, -28.4], r: 7.2 },
  { c: [14.5, 31.4], r: 6 },
  { c: [0, 31.4], r: 6 },
  { c: [-14.5, 31.4], r: 6 },
  { c: [-31, 28.4], r: 7.2 },
]

// Lay a row of identical cells (offices / breakout rooms) between two coordinates.
// axis 'x' walks cells along x at fixed z-band [z0,z1]; axis 'z' walks along z at [x0,x1].
export function officeRow(f, opts) {
  const { axis, from, to, band, count, depthDoor, names = [], id0, mat = 'white' } = opts
  const step = (to - from) / count
  for (let i = 0; i < count; i++) {
    const a = from + i * step
    const b = a + step
    const name = names[i] || 'Faculty Office'
    const id = id0 != null ? String(id0 + i * 2) : undefined
    if (axis === 'x') {
      // cells side by side along x; door faces `depthDoor` ('N' toward smaller z, 'S' toward larger z)
      f.room(a + 0.12, band[0], b - 0.12, band[1], { name, id, door: depthDoor, mat, g: 0.7 })
    } else {
      f.room(band[0], a + 0.12, band[1], b - 0.12, { name, id, door: depthDoor, mat, g: 0.7 })
    }
  }
}

export const { xMin, xMax, zMin, zMax } = BOUNDS
