import { makeFloor } from '../kit.js'
import { PODS, xMin } from './shared.js'

// Furnish a classroom pod: whiteboard + screen on the courtyard-facing wall, desks/chairs
// fanning back toward the perimeter. `face` points from the pod center toward the courtyard.
export function furnishClassroom(f, cx, cz, r, fx, fz) {
  const bx = -fx
  const bz = -fz // toward the seats
  const tx = -fz
  const tz = fx // tangent
  const rot = Math.atan2(-fx, -fz) // chairs face the front
  // whiteboard + screen
  const wx = cx + fx * (r - 0.55)
  const wz = cz + fz * (r - 0.55)
  f.box(wx, wz, Math.abs(tx) * 4.4 + 0.2, Math.abs(tz) * 4.4 + 0.2, 1.1, 'board', 1.0)
  f.box(wx - fx * 0.05, wz - fz * 0.05, Math.abs(tx) * 2.3 + 0.1, Math.abs(tz) * 2.3 + 0.1, 1.3, 'screen', 2.0)
  f.box(cx + bx * 1.0, cz + bz * 1.0, 0.7, 0.7, 1.05, 'dark', 0) // lectern
  // desks + chairs fanning back
  for (let rr = 2.4; rr < r - 1.0; rr += 1.35) {
    const span = Math.min(rr * 0.85, r - 1.2)
    f.box(cx + bx * rr, cz + bz * rr, Math.abs(tx) * span * 2 + 0.3, Math.abs(tz) * span * 2 + 0.3, 0.05, 'desk', 0.72)
    for (let s = -span + 0.6; s <= span - 0.6; s += 1.2) {
      f.seat(cx + bx * (rr + 0.55) + tx * s, cz + bz * (rr + 0.55) + tz * s, rot)
    }
  }
}

// 2nd Floor rebuilt in the shared kit (the fully detailed version still lives in src/layout.js
// and the standalone index.html experience). Classroom pods ring the courtyard; Ross Library to
// the west, Beinecke Terrace Room bulging east. Traced from view-levels-3.png.
export default function build() {
  const f = makeFloor()

  const rooms = [
    ['Nooyi Classroom', '2230'],
    ['Jones Classroom', '2220'],
    ['Allison Foundation Classroom', '2210'],
    ['Blumetti Classroom', '2200'],
    ['Baker Classroom', '2430'],
    ['Betts Classroom', '2420'],
    ['Bewkes Classroom', '2410'],
    ['MBA Class of 1980 Classroom', '2400'],
  ]
  PODS.forEach((p, i) => {
    const north = p.c[1] < 0
    const doorAng = north ? 0 : Math.PI // door faces the courtyard
    f.round(p.c[0], p.c[1], p.r, { name: rooms[i][0], id: rooms[i][1], doorAng, mat: 'drum' })
  })
  // furnish one classroom (Baker, south-east pod)
  furnishClassroom(f, PODS[4].c[0], PODS[4].c[1], PODS[4].r, 0, -1)

  // Ross Library (west bar)
  f.room(xMin + 1.0, -12, xMin + 11.5, 12, { name: 'Ross Library', id: '2100', door: 'E', carpet: 'beinCarpet' })
  for (const zx of [-9, -3, 3, 9]) f.box(xMin + 3.5, zx, 6, 0.5, 1.8, 'shelf', 0)
  for (const zx of [-6, 0, 6]) f.box(xMin + 8, zx, 1.6, 1.0, 0.76, 'desk', 0)

  // Beinecke Terrace Room (east, bulges east)
  f.round(28.0, 0, 9, { name: 'Beinecke Terrace Room', id: '2300', doorAng: Math.PI, gap: 0.3, mat: 'glass', carpet: 'beinCarpet' })
  for (const [dx, dz] of [[4, -4.5], [4, 4.5], [1.5, 0]]) f.cyl(28 + dx, dz, 0.8, 0.74, 'desk', 0)

  return f
}
