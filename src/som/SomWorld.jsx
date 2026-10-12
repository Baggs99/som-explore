import { useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as T from '../textures.js'
import { EvansInterior } from '../World.jsx'
import { BOUNDS, COURTYARD, LEVELS, baseY, TOP_Y, TAU } from './geo.js'
import { WALLS_BY_MAT, ROUNDS, SIGNS, DISCS, BOXES_BY_MAT, CYLS, CHAIRS, DETAILED_F2 } from './building.js'

const { xMin, xMax, zMin, zMax } = BOUNDS
const BOX = new THREE.BoxGeometry(1, 1, 1)
const SPHERE = new THREE.SphereGeometry(1, 16, 12)

function Instanced({ items, material, geometry }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3()
    items.forEach((it, i) => {
      p.set(...it.p)
      e.set(0, it.r || 0, 0)
      q.setFromEuler(e)
      s.set(...(it.s || [1, 1, 1]))
      m.compose(p, q, s)
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])
  if (!items.length) return null
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />
}

function ribbon(points, y0, y1, uPerMeter = 0.2) {
  const pts = [...points, points[0]]
  const pos = []
  const uv = []
  const idx = []
  let u = 0
  pts.forEach((p, i) => {
    if (i > 0) u += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) * uPerMeter
    pos.push(p[0], y0, p[1], p[0], y1, p[1])
    uv.push(u, 0, u, 1)
    if (i > 0) {
      const a = (i - 1) * 2
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function useMaterials() {
  return useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o)
    const basic = (map) => new THREE.MeshBasicMaterial({ map })
    const glass = (color, opacity) =>
      std({ color, transparent: true, opacity, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false })
    return {
      white: std({ color: '#f2f0ec', roughness: 0.9 }),
      sage: std({ map: T.sageTex(), roughness: 0.9 }),
      exterior: glass('#2a3a55', 0.28),
      glass: glass('#d7ecf2', 0.14),
      roof: glass('#cfe6ee', 0.2),
      steel: std({ color: '#c9ced6', metalness: 0.85, roughness: 0.3 }),
      drum: std({ map: T.drumTex(), roughness: 0.1, metalness: 0.6, envMapIntensity: 1.5 }),
      desk: std({ map: T.teakTex(), roughness: 0.55 }),
      shelf: std({ map: T.booksTex(), roughness: 0.8 }),
      leather: std({ color: '#9a4f22', roughness: 0.45 }),
      orange: std({ color: '#d4552a', roughness: 0.8 }),
      chair: std({ color: '#0a0a0b', roughness: 0.85, envMapIntensity: 0.25 }),
      chairBlue: std({ color: '#24407f', roughness: 0.6 }),
      mullion: std({ color: '#2a2d33', roughness: 0.4, metalness: 0.6 }),
      board: std({ color: '#fbfbf8', roughness: 0.3 }),
      dark: std({ color: '#1b1c20', roughness: 0.6 }),
      screen: basic(T.screenTex()),
      roomCarpet: std({ map: T.carpetTex([3, 3], '#c3bcae'), roughness: 1 }),
      officeCarpet: std({ map: T.carpetTex([3, 3], '#6f7682', ['#5f6570', '#7a818d', '#676d78']), roughness: 1 }),
      beinCarpet: std({ map: T.carpetTex([4, 4]), roughness: 1 }),
      carpet: std({ map: T.carpetTex(), color: '#d9cdb8', roughness: 1 }),
      concrete: std({ color: '#9a9a9e', roughness: 1 }),
      line: std({ color: '#e8e4d8', roughness: 1 }),
      slatDark: std({ map: T.darkSlatTex(), roughness: 0.75, side: THREE.DoubleSide }),
      gloss: std({ color: '#0a0a0c', roughness: 0.12, metalness: 0.35, envMapIntensity: 1.3 }),
      projector: std({ color: '#2b2e34', roughness: 0.5 }),
      lamp: new THREE.MeshBasicMaterial({ color: '#fff4de' }),
      leaf: std({ color: '#3f7a35', roughness: 0.9 }),
      fifty: new THREE.MeshBasicMaterial({ map: T.fiftyYearsTex(), transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }),
      tileFloor: std({ map: T.tileTex(), roughness: 0.55 }),
      mural: new THREE.MeshBasicMaterial({ map: T.leWittCircles() }),
      muralSq: new THREE.MeshBasicMaterial({ map: T.leWittStripes() }),
      menu: new THREE.MeshBasicMaterial({ map: T.menuTex() }),
      teal: std({ color: '#2f6f74', roughness: 0.6 }),
      orangeLeather: std({ color: '#c0632a', roughness: 0.6 }),
      ceiling: std({ color: '#f7f5f0', roughness: 1, side: THREE.DoubleSide }),
      lawn: std({ map: T.lawnTex(), roughness: 1 }),
      ground: std({ color: '#2b3a26', roughness: 1 }),
      trunk: std({ color: '#4a3524', roughness: 1 }),
      crown: std({ color: '#2f4a25', roughness: 1 }),
      column: std({ color: '#eceae6', roughness: 0.6 }),
    }
  }, [])
}

function Atmosphere() {
  const { gl, scene } = useThree()
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.55
    scene.background = T.skyTex()
    return () => {
      env.dispose()
      pm.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <hemisphereLight args={['#e3ebff', '#8a7a66', 0.8]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[20, 60, 10]} intensity={0.6} />
    </>
  )
}

// floor + ceiling slabs for each level (courtyard hole on levels 1-5)
function Slabs({ M }) {
  const geos = useMemo(() => {
    const full = () => {
      const s = new THREE.Shape([
        new THREE.Vector2(xMin, -zMin),
        new THREE.Vector2(xMax, -zMin),
        new THREE.Vector2(xMax, -zMax),
        new THREE.Vector2(xMin, -zMax),
      ])
      return s
    }
    const holed = () => {
      const s = full()
      s.holes.push(new THREE.Path(COURTYARD.map(([x, z]) => new THREE.Vector2(x, -z))))
      return s
    }
    const flat = (shape) => {
      const g = new THREE.ShapeGeometry(shape)
      g.rotateX(-Math.PI / 2)
      return g
    }
    const plaza = new THREE.Shape(COURTYARD.map(([x, z]) => new THREE.Vector2(x, -z)))
    return {
      fullSlab: flat(full()),
      holedSlab: flat(holed()),
      plaza: flat(plaza),
    }
  }, [])
  return (
    <>
      {LEVELS.map((lvl) => {
        if (lvl.idx === DETAILED_F2) return null // detailed floor 2 brings its own slab + ceiling
        const y = baseY(lvl.idx)
        const floorGeo = lvl.void ? geos.holedSlab : geos.fullSlab
        const floorMat = lvl.idx === 0 ? M.concrete : lvl.idx >= 3 ? M.officeCarpet : M.carpet
        return (
          <group key={lvl.id}>
            <mesh geometry={floorGeo} material={floorMat} position={[0, y + 0.005, 0]} />
            {/* ceilings are always holed at the courtyard so the void stays open down to the
                sunken lawn (the glass roof caps the top). */}
            <mesh
              geometry={geos.holedSlab}
              material={M.ceiling}
              position={[0, y + 4.6 - (lvl.idx === 1 ? 0.06 : 0), 0]}
            />
          </group>
        )
      })}
      {/* glass roof over the void (the sunken Shen Courtyard plaza comes from the detailed floor 2) */}
      <mesh geometry={geos.plaza} material={M.roof} position={[0, TOP_Y, 0]} />
    </>
  )
}

// The detailed floor-2 courtyard glazes the void up to ~2 floors; this caps the rest up to the
// glass roof so floors 3-5 read as enclosed around the void.
function VoidCap({ M }) {
  const glass = useMemo(() => ribbon(COURTYARD, 4.6 * 2.9, TOP_Y), [])
  return <mesh geometry={glass} material={M.glass} />
}

// auditorium roof dome at the north end
function Dome({ M }) {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 24, 12, 0, TAU, 0, Math.PI / 2)
    return g
  }, [])
  return <mesh geometry={geo} material={M.drum} position={[-3, baseY(5) + 4.6, zMin + 12]} scale={[13, 9, 13]} />
}

function Walls({ M }) {
  const groups = useMemo(() => Object.entries(WALLS_BY_MAT).filter(([m]) => M[m]), [M])
  return groups.map(([m, items]) => <Instanced key={m} items={items} material={M[m]} geometry={BOX} />)
}

function Rounds({ M }) {
  return ROUNDS.map((r, i) => {
    const geo = new THREE.CylinderGeometry(1, 1, r.h, 64, 1, true, r.a0, r.a1 - r.a0)
    return (
      <mesh key={i} geometry={geo} material={M[r.mat] || M.drum} position={[r.c[0], r.y + r.h / 2, r.c[1]]} scale={[r.r, 1, r.r]} />
    )
  })
}

function Discs({ M }) {
  return DISCS.map((d, i) => {
    if (d.rect) {
      const [x0, z0, x1, z1] = d.rect
      return (
        <mesh key={i} material={M[d.mat] || M.roomCarpet} position={[(x0 + x1) / 2, d.y + 0.012 + (d.lift || 0), (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Math.abs(x1 - x0), Math.abs(z1 - z0)]} />
        </mesh>
      )
    }
    if (d.down) {
      // elliptical dropped ceiling, facing down
      return (
        <mesh key={i} material={M[d.mat] || M.slatDark} position={[d.c[0], d.y + d.yLocal, d.c[1]]} rotation={[Math.PI / 2, 0, 0]} scale={[d.rx, d.rz, 1]}>
          <circleGeometry args={[1, 48]} />
        </mesh>
      )
    }
    return (
      <mesh key={i} material={M[d.mat] || M.roomCarpet} position={[d.c[0], d.y + 0.012, d.c[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[d.r, 40]} />
      </mesh>
    )
  })
}

const signCache = new Map()
function signMat(name, id) {
  const k = `${name}|${id}`
  if (!signCache.has(k)) signCache.set(k, new THREE.MeshBasicMaterial({ map: T.signTex(name, id || '') }))
  return signCache.get(k)
}
function Signs() {
  return SIGNS.map((s, i) => (
    <mesh key={i} material={signMat(s.name, s.id)} position={[s.x, s.y + 1.55, s.z]} rotation={[0, s.rot, 0]}>
      <planeGeometry args={[0.5, 0.62]} />
    </mesh>
  ))
}

function Boxes({ M }) {
  const groups = useMemo(() => Object.entries(BOXES_BY_MAT).filter(([m]) => M[m]), [M])
  return groups.map(([m, items]) => <Instanced key={m} items={items} material={M[m]} geometry={BOX} />)
}

function Cyls({ M }) {
  return CYLS.map((c, i) => (
    <mesh key={i} material={M[c.mat] || M.desk} position={c.p}>
      <cylinderGeometry args={[c.r, c.r, c.h, 24]} />
    </mesh>
  ))
}

function Chairs({ M }) {
  const groups = useMemo(() => {
    const by = {}
    for (const c of CHAIRS) (by[c.mat && M[c.mat] ? c.mat : 'chair'] ||= []).push(c)
    return by
  }, [M])
  return Object.entries(groups).map(([mat, list]) => {
    const seats = list.map((c) => ({ p: [c.x, c.y + 0.47, c.z], r: c.rot, s: [0.5, 0.08, 0.5] }))
    const backs = list.map((c) => ({ p: [c.x + Math.sin(c.rot) * 0.22, c.y + 0.8, c.z + Math.cos(c.rot) * 0.22], r: c.rot, s: [0.5, 0.6, 0.06] }))
    const legs = list.map((c) => ({ p: [c.x, c.y + 0.22, c.z], s: [0.06, 0.44, 0.06] }))
    return (
      <group key={mat}>
        <Instanced items={seats} material={M[mat]} geometry={BOX} />
        <Instanced items={backs} material={M[mat]} geometry={BOX} />
        <Instanced items={legs} material={M.mullion} geometry={BOX} />
      </group>
    )
  })
}

export default function SomWorld() {
  const M = useMaterials()
  return (
    <>
      <Atmosphere />
      <Slabs M={M} />
      <VoidCap M={M} />
      <EvansInterior showGlass ground={false} cafeGlass />
      <Dome M={M} />
      <Walls M={M} />
      <Rounds M={M} />
      <Discs M={M} />
      <Signs />
      <Boxes M={M} />
      <Cyls M={M} />
      <Chairs M={M} />
      {/* ground plane far below for context */}
      <mesh material={M.ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY(0) - 0.1, 0]}>
        <planeGeometry args={[600, 600]} />
      </mesh>
    </>
  )
}
