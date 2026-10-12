import { makeFloor } from '../kit.js'
import { furnishClassroom } from './floor2.js'
import { PODS, officeRow, xMin, xMax, zMax } from './shared.js'

// 4th Floor: the second classroom ring (pods stacked over the floor-2 pods), Kenney Reading
// Room to the south, faculty offices down the east bar. Traced from view-levels-5.png.
export default function build() {
  const f = makeFloor()

  const rooms = [
    ['Swersey Classroom', '4430'],
    ['Farr Classroom', '4420'],
    ['Gambhir Classroom', '4410'],
    ['Lin Classroom', '4400'],
    ['Attwood Classroom', '4230'],
    ['Gould Classroom', '4220'],
    ['Isaacson Classroom', '4210'],
    ['Qian and Yu Classroom', '4200'],
  ]
  PODS.forEach((p, i) => {
    const north = p.c[1] < 0
    f.round(p.c[0], p.c[1], p.r, { name: rooms[i][0], id: rooms[i][1], doorAng: north ? 0 : Math.PI, mat: 'drum' })
  })
  furnishClassroom(f, PODS[4].c[0], PODS[4].c[1], PODS[4].r, 0, -1) // Attwood

  // Kenney Reading Room (south, center)
  f.room(-9, zMax - 10, 9, zMax - 1.2, { name: 'Kenney Reading Room', door: 'N', carpet: 'beinCarpet' })
  for (const zx of [-5, 0, 5]) f.box(zx, zMax - 5.5, 2.4, 1.0, 0.76, 'desk', 0)

  // Lactation Room 4244 (west, small)
  f.room(xMin + 1.0, -4, xMin + 6, 4, { name: 'Lactation Room', id: '4244', door: 'E' })

  // East bar faculty offices (4512-4536)
  officeRow(f, { axis: 'z', from: -20, to: 20, band: [20, xMax - 1.0], count: 8, depthDoor: 'W', id0: 4512, mat: 'white' })
  f.label('Faculty Offices · 4512-4536', (x, z) => x > 20 && z > -20 && z < 20)

  return f
}
