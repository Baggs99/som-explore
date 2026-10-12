import { makeFloor } from '../kit.js'
import { xMin, xMax, zMin, zMax } from './shared.js'

// Lower Level: a full slab (no courtyard void). Mostly parking, with service suites
// around the perimeter. Traced from reference/plan-pages/view-levels-1.png.
export default function build() {
  const f = makeFloor()

  // North service band
  f.room(-28, zMin + 1.3, -18, zMin + 9, { name: 'Fit for Thought', id: 'L330', door: 'S' })
  f.room(-16, zMin + 1.3, -4, zMin + 10, { name: 'Broadcast Studio', id: 'L340', door: 'S' })
  f.room(3, zMin + 1.3, 17, zMin + 9, { name: 'Operations & IT Suite', id: 'L420-L435', door: 'S' })
  f.room(18.5, zMin + 1.3, xMax - 1.3, zMin + 9, { name: 'Honest Tea Entrepreneurship', id: 'L400-L410', door: 'S' })
  f.room(18.5, zMin + 11, xMax - 1.3, zMin + 17, { name: 'IT Help Desk', door: 'S' })

  // East band
  f.room(19.5, -9, xMax - 1.3, 3, { name: 'Mailroom · Lost & Found · SOM Gear', door: 'W' })

  // West band
  f.room(xMin + 1.3, -22, xMin + 10, -6, { name: 'Behavioral Research Suite', id: 'L210-L220', door: 'E' })
  f.room(xMin + 1.3, 28, xMin + 10, 44, { name: 'Locker Room', id: 'L200', door: 'E' })

  // South band
  f.room(-24, zMax - 9, -14, zMax - 1.3, { name: 'Vending & ATM', door: 'N' })

  // ---- Parking: painted stripes + a handful of parked cars (whimsical low-poly) ----
  f.label('Staff & Faculty Parking', (x, z) => x > -8 && z > -6 && z < 30)
  f.label('Bicycle Parking', (x, z) => x < -8 && x > -28 && z > -2 && z < 26)
  for (let x = -4; x < 24; x += 5.5) {
    f.box(x, 12, 0.12, 30, 0.02, 'line', 0.01) // stripe
  }
  const carCols = ['drum', 'orange', 'leather', 'dark', 'steel']
  let ci = 0
  for (let x = -1.5; x < 22; x += 5.5)
    for (const z of [2.5, 21.5]) {
      f.box(x, z, 1.8, 4.2, 1.35, carCols[ci++ % carCols.length], 0.05)
      f.box(x, z, 1.7, 2.2, 0.5, 'glass', 1.35) // greenhouse
    }
  // bike racks
  for (let z = 2; z < 26; z += 3.2) f.box(-20, z, 5, 0.1, 1.0, 'steel', 0)

  // slab perimeter (exterior) is added by building.js; nothing else here.
  return f
}
