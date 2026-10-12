import { makeFloor } from '../kit.js'
import { officeRow, xMin, xMax, zMin, zMax } from './shared.js'

// 3rd Floor: office floor. PhD Suite to the west, faculty-office rings east / north / south
// around a wide courtyard void. Traced from view-levels-4.png.
export default function build() {
  const f = makeFloor()

  // PhD Suite (west bar)
  f.room(xMin + 1.0, -20, xMin + 11.5, 20, { name: 'PhD Suite', id: '3410-3242', door: 'E', mat: 'white', carpet: 'officeCarpet' })

  // East bar faculty offices
  officeRow(f, { axis: 'z', from: -36, to: 36, band: [20, xMax - 1.0], count: 12, depthDoor: 'W', id0: 3461, mat: 'white' })
  f.label('Faculty Offices · 3461-3479', (x, z) => x > 20 && z > -36 && z < -4)
  f.label('Faculty Offices · 3514-3536', (x, z) => x > 20 && z >= -4 && z < 36)

  // North bar faculty offices (3538-3562)
  officeRow(f, { axis: 'x', from: -24, to: 16, band: [zMin + 1.0, zMin + 8], count: 7, depthDoor: 'S', id0: 3538, mat: 'white' })
  f.label('Faculty Offices · 3538-3562', (x, z) => z < zMin + 9 && x > -26 && x < 18)

  // South bar faculty offices (3502-3512)
  officeRow(f, { axis: 'x', from: -24, to: 16, band: [zMax - 8, zMax - 1.0], count: 6, depthDoor: 'N', id0: 3502, mat: 'white' })
  f.label('Faculty Offices · 3502-3512', (x, z) => z > zMax - 9 && x > -26 && x < 18)

  return f
}
