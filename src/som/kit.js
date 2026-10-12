// A small toolkit each floor uses to declare its layout as plain data.
// Everything is in that floor's local XZ, with y measured from the floor slab (y0).
// building.js stacks the result at the level's baseY.
import { H, TAU } from './geo.js'

export function makeFloor() {
  const walls = [] // { a:[x,z], b:[x,z], mat, h, y0, t, collide }
  const rounds = [] // visual drum/cylinder rooms { c, r, a0, a1, h, mat }
  const discs = [] // carpet patches { rect:[x0,z0,x1,z1] } or { c:[x,z], r }, mat
  const signs = [] // { x, z, rot, name, id }
  const boxes = [] // furniture/props { p:[x,y,z], s:[w,h,d], mat }
  const cyls = [] // cylindrical props { p:[x,y,z], r, h, mat }
  const chairs = [] // { x, z, rot }
  const labels = [] // room lookup regions { test(x,z) -> bool, name }

  const api = { walls, rounds, discs, signs, boxes, cyls, chairs, labels }

  api.W = (a, b, mat, o = {}) =>
    walls.push({ a, b, mat, h: o.h ?? H, y0: o.y0 ?? 0, t: o.t ?? 0.2, collide: o.collide ?? true })

  api.poly = (pts, mat, o) => {
    for (let i = 0; i < pts.length - 1; i++) api.W(pts[i], pts[i + 1], mat, o)
  }

  api.rect = (x0, z0, x1, z1, mat, o) =>
    api.poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]], mat, o)

  // `lift` nudges the decal above any carpet beneath it to avoid z-fighting when they overlap
  api.carpet = (x0, z0, x1, z1, mat = 'roomCarpet', lift = 0) => discs.push({ rect: [x0, z0, x1, z1], mat, lift })
  api.disc = (cx, cz, r, mat = 'roomCarpet') => discs.push({ c: [cx, cz], r, mat })
  // a (possibly elliptical) horizontal panel at a local height, facing down — e.g. a dropped ceiling
  api.ceilingDisc = (cx, cz, rx, rz, yLocal, mat) =>
    discs.push({ c: [cx, cz], rx, rz, yLocal, down: true, mat })
  api.sign = (x, z, rot, name, id) => signs.push({ x, z, rot, name, id })
  api.box = (x, z, w, d, h, mat, y0 = 0) => boxes.push({ p: [x, y0 + h / 2, z], s: [w, h, d], mat })
  api.cyl = (x, z, r, h, mat, y0 = 0) => cyls.push({ p: [x, y0 + h / 2, z], r, h, mat })
  api.chair = (x, z, rot) => chairs.push({ x, z, rot })
  api.label = (name, test) => labels.push({ name, test })

  // one straight wall with a centered door opening of width 2*g
  api.doorWall = (a, b, mat, g = 0.9, o = {}) => {
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const len = Math.hypot(dx, dz) || 1
    const ux = dx / len
    const uz = dz / len
    const mx = (a[0] + b[0]) / 2
    const mz = (a[1] + b[1]) / 2
    api.W(a, [mx - ux * g, mz - uz * g], mat, o)
    api.W([mx + ux * g, mz + uz * g], b, mat, o)
  }

  // rectangular room: 4 walls (a door gap on `door`), a name sign at the door, a carpet fill,
  // and a lookup label covering the interior.
  api.room = (x0, z0, x1, z1, opts = {}) => {
    const { name, id, door = 'S', mat = 'white', carpet = 'roomCarpet', g = 0.9 } = opts
    const edge = (side, A, B) => (door === side ? api.doorWall(A, B, mat, g) : api.W(A, B, mat))
    edge('N', [x0, z0], [x1, z0]) // z0 is north
    edge('S', [x0, z1], [x1, z1])
    edge('W', [x0, z0], [x0, z1])
    edge('E', [x1, z0], [x1, z1])
    if (carpet) api.carpet(x0 + 0.1, z0 + 0.1, x1 - 0.1, z1 - 0.1, carpet)
    const cx = (x0 + x1) / 2
    const cz = (z0 + z1) / 2
    if (name) {
      const sp = {
        N: [cx, z0 - 0.12, Math.PI],
        S: [cx, z1 + 0.12, 0],
        W: [x0 - 0.12, cz, -Math.PI / 2],
        E: [x1 + 0.12, cz, Math.PI / 2],
      }[door]
      api.sign(sp[0], sp[1], sp[2], name, id)
      api.label(id ? `${name} · ${id}` : name, (x, z) => x > x0 && x < x1 && z > z0 && z < z1)
    }
  }

  // a round room (classroom drum / auditorium / cafe): rendered as an open cylinder arc,
  // collided as an arc polyline, with a carpet disc, a sign, and a lookup label.
  api.round = (cx, cz, r, opts = {}) => {
    const { name, id, mat = 'drum', doorAng = 0, gap = 0.26, h = H, sign = true, carpet = 'roomCarpet' } = opts
    const a0 = doorAng + gap
    const a1 = doorAng - gap + TAU
    rounds.push({ c: [cx, cz], r, a0, a1, h, mat })
    const n = Math.max(10, Math.round(((a1 - a0) / TAU) * 56))
    const pts = []
    for (let i = 0; i <= n; i++) {
      const t = a0 + ((a1 - a0) * i) / n
      pts.push([cx + r * Math.sin(t), cz + r * Math.cos(t)])
    }
    for (let i = 0; i < pts.length - 1; i++)
      walls.push({ a: pts[i], b: pts[i + 1], mat: 'none', h, y0: 0, t: 0.2, collide: true })
    if (carpet) discs.push({ c: [cx, cz], r: r - 0.12, mat: carpet })
    if (sign && name) {
      const t = doorAng + gap + 0.22
      api.sign(cx + (r + 0.12) * Math.sin(t), cz + (r + 0.12) * Math.cos(t), Math.atan2(Math.sin(t), Math.cos(t)), name, id)
    }
    if (name) api.label(id ? `${name} · ${id}` : name, (x, z) => Math.hypot(x - cx, z - cz) < r)
    return { c: [cx, cz], r }
  }

  // stacking chair (seat + back + legs); `mat` overrides the default black seat material
  api.seat = (x, z, rot, mat) => chairs.push({ x, z, rot, mat })

  return api
}
