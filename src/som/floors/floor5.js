import { makeFloor } from '../kit.js'
import { officeRow, xMin, xMax, zMin, zMax } from './shared.js'

// 5th Floor: the top faculty-office ring around the courtyard void, capped by the glass roof
// (added in building.js). Traced from view-levels-6.png.
export default function build() {
  const f = makeFloor()

  // West bar offices (5212-5230)
  officeRow(f, { axis: 'z', from: -18, to: 18, band: [xMin + 1.0, xMin + 8], count: 10, depthDoor: 'E', id0: 5212, mat: 'white' })
  f.label('Faculty Offices · 5212-5230', (x, z) => x < xMin + 9 && z > -18 && z < 18)

  // East bar offices (5461-5479 / 5512-5536)
  officeRow(f, { axis: 'z', from: -34, to: 34, band: [20, xMax - 1.0], count: 12, depthDoor: 'W', id0: 5461, mat: 'white' })
  f.label('Faculty Offices · 5461-5479', (x, z) => x > 20 && z > -34 && z < 0)
  f.label('Faculty Offices · 5512-5536', (x, z) => x > 20 && z >= 0 && z < 34)

  // North bar offices (5455-5459)
  officeRow(f, { axis: 'x', from: -22, to: 14, band: [zMin + 1.0, zMin + 8], count: 6, depthDoor: 'S', id0: 5455, mat: 'white' })
  f.label('Faculty Offices · 5455-5459', (x, z) => z < zMin + 9 && x > -24 && x < 16)

  // South bar offices (5501-5510)
  officeRow(f, { axis: 'x', from: -22, to: 14, band: [zMax - 8, zMax - 1.0], count: 6, depthDoor: 'N', id0: 5501, mat: 'white' })
  f.label('Faculty Offices · 5501-5510', (x, z) => z > zMax - 9 && x > -24 && x < 16)

  return f
}
