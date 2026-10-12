import { useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as T from '../textures.js'

// Hand-authored from the office photos (the blind LiDAR segmentation wasn't
// faithful). Low-res, procedural, same spirit as the Evans Hall walk-through.
// Frame: +x east, +z south. Window at north (-z), door + TV at south (+z),
// cork board on the west wall, whiteboard on the east wall.
export const ROOM = { w: 3.0, d: 5.0, h: 2.7 }
export const EYE = 1.65
const { w: W, d: D, h: H } = ROOM
const west = -W / 2
const east = W / 2
const north = -D / 2
const south = D / 2

// solid things the player can't walk through: [x, z, width(x), depth(z)]
export const COLLIDERS = [
  { x: west + 0.4, z: -0.85, w: 0.8, d: 2.8 }, // desk along west wall
  { x: -0.15, z: north + 0.4, w: 1.9, d: 0.8 }, // desk under the window
  { x: -0.45, z: -1.15, w: 0.7, d: 0.7 }, // office chair
  { x: east - 0.33, z: 1.25, w: 0.62, d: 0.6 }, // guest chair 1
  { x: east - 0.33, z: 2.0, w: 0.62, d: 0.6 }, // guest chair 2
  { x: 0.6, z: 1.95, w: 0.5, d: 0.4 }, // backpack
]

function Atmosphere() {
  const { gl, scene } = useThree()
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.5
    scene.background = new THREE.Color('#d8dae0')
    return () => {
      env.dispose()
      pm.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <hemisphereLight args={['#ffffff', '#9a958c', 0.7]} />
      <ambientLight intensity={0.3} />
      {/* glow from the ceiling fluorescent fixture */}
      <pointLight position={[0, H - 0.3, -0.3]} intensity={18} distance={9} decay={2} color={'#fff6e8'} />
      <directionalLight position={[2, 6, 3]} intensity={0.35} />
    </>
  )
}

function useMaterials() {
  return useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o)
    return {
      wall: std({ color: '#edeae4', roughness: 0.96 }),
      carpet: std({
        map: T.carpetTex([5, 8], '#34373c', ['#2b2e33', '#404449', '#484c52', '#303338', '#3a3d42']),
        roughness: 1,
      }),
      ceiling: std({ map: T.ceilingTileTex(), roughness: 1, side: THREE.DoubleSide }),
      panel: new THREE.MeshBasicMaterial({ color: '#fffdf5' }), // lit fixture
      desk: std({ color: '#38261a', roughness: 0.5, metalness: 0.05 }), // espresso laminate
      cork: std({ map: T.corkTex(), roughness: 0.95 }),
      frame: std({ color: '#b9bcc0', metalness: 0.5, roughness: 0.4 }),
      board: std({ color: '#f7f7f3', roughness: 0.25 }),
      shade: std({ map: T.shadeTex(), roughness: 0.9 }),
      tv: std({ color: '#0a0a0c', roughness: 0.15, metalness: 0.4 }),
      black: std({ color: '#141416', roughness: 0.8 }),
      metal: std({ color: '#2a2d33', roughness: 0.4, metalness: 0.6 }),
      hiVis: std({ color: '#d4e02a', roughness: 0.7, emissive: '#5a6600', emissiveIntensity: 0.25 }),
      sign: new THREE.MeshBasicMaterial({ map: T.parkingSignTex() }),
      silver: std({ color: '#b9bcc2', roughness: 0.4, metalness: 0.6 }),
      screen: new THREE.MeshBasicMaterial({ map: T.screenTex() }),
      sticky1: std({ color: '#7bd66a', roughness: 1 }),
      sticky2: std({ color: '#ff6fae', roughness: 1 }),
      cereal: std({ color: '#d4552a', roughness: 0.8 }),
      plant: std({ color: '#3f7a35', roughness: 0.9 }),
      pot: std({ color: '#26262a', roughness: 0.7 }),
      doorway: new THREE.MeshBasicMaterial({ color: '#15171a' }),
      dogbed: std({ color: '#cbbfa8', roughness: 1 }),
      trash: std({ color: '#3a3d42', roughness: 0.6 }),
    }
  }, [])
}

// a thin box, handy for boards mounted flat on a wall
function Box({ p, s, m, rot = [0, 0, 0] }) {
  return (
    <mesh position={p} rotation={rot} material={m} castShadow receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  )
}

function OfficeChair({ p, M }) {
  const [x, z] = p
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.47, 0]} s={[0.52, 0.1, 0.5]} m={M.black} />
      <Box p={[0, 0.85, 0.24]} s={[0.52, 0.66, 0.1]} m={M.black} />
      <mesh position={[0, 0.28, 0]} material={M.metal}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 10]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.25, 0.05, Math.cos(a) * 0.25]} material={M.metal}>
            <boxGeometry args={[0.07, 0.06, 0.34]} rotation={[0, a, 0]} />
          </mesh>
        )
      })}
    </group>
  )
}

function GuestChair({ p, M }) {
  const [x, z] = p
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.46, 0]} s={[0.52, 0.1, 0.5]} m={M.black} />
      <Box p={[0.26, 0.74, 0]} s={[0.06, 0.6, 0.5]} m={M.black} />
      {[[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]} material={M.metal}>
          <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
        </mesh>
      ))}
    </group>
  )
}

export default function OfficeWorld() {
  const M = useMaterials()
  const t = 0.1

  return (
    <>
      <Atmosphere />

      {/* shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.carpet} receiveShadow>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} material={M.ceiling}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <Box p={[0, H - 0.015, -0.3]} s={[1.2, 0.03, 0.55]} m={M.panel} />
      <Box p={[west, H / 2, 0]} s={[t, H, D]} m={M.wall} />
      <Box p={[east, H / 2, 0]} s={[t, H, D]} m={M.wall} />
      <Box p={[0, H / 2, north]} s={[W, H, t]} m={M.wall} />
      {/* south wall split around the doorway (door on the west side) */}
      <Box p={[0.475, H / 2, south]} s={[2.05, H, t]} m={M.wall} />
      <Box p={[-1.425, H / 2, south]} s={[0.15, H, t]} m={M.wall} />
      <Box p={[-0.95, 2.4, south]} s={[0.8, 0.6, t]} m={M.wall} />
      <Box p={[-0.95, 1.05, south + 0.02]} s={[0.8, 2.1, 0.02]} m={M.doorway} />

      {/* west wall: cork board */}
      <Box p={[west + 0.03, 1.5, -0.6]} s={[0.1, 1.15, 1.9]} m={M.frame} />
      <Box p={[west + 0.08, 1.5, -0.6]} s={[0.04, 1.0, 1.78]} m={M.cork} />

      {/* east wall: whiteboard + two little black floating shelves + gray panel toward the door */}
      <Box p={[east - 0.03, 1.5, -1.3]} s={[0.1, 1.15, 1.7]} m={M.frame} />
      <Box p={[east - 0.08, 1.5, -1.3]} s={[0.04, 1.0, 1.58]} m={M.board} />
      <Box p={[east - 0.18, 1.55, 0.2]} s={[0.3, 0.04, 0.7]} m={M.black} />
      <Box p={[east - 0.18, 1.9, 0.2]} s={[0.3, 0.04, 0.7]} m={M.black} />
      <Box p={[east - 0.04, 1.35, 1.3]} s={[0.05, 1.25, 1.6]} m={M.shade} />

      {/* north wall: window with roller shade + sill plants */}
      <Box p={[0.1, 1.78, north + 0.04]} s={[1.75, 1.1, 0.05]} m={M.shade} />
      <Box p={[0.1, 2.36, north + 0.05]} s={[1.85, 0.08, 0.1]} m={M.metal} />
      {[-0.4, 0.2, 0.6].map((x, i) => (
        <group key={i} position={[x, 1.2, north + 0.18]}>
          <mesh material={M.pot}><boxGeometry args={[0.12, 0.12, 0.12]} /></mesh>
          <mesh position={[0, 0.14, 0]} material={M.plant}><sphereGeometry args={[0.12, 8, 6]} /></mesh>
        </group>
      ))}

      {/* south wall: TV + hanging hi-vis jackets beside the door (door on the west) */}
      <Box p={[0.35, 1.6, south - 0.06]} s={[1.45, 0.82, 0.07]} m={M.metal} />
      <Box p={[0.35, 1.6, south - 0.09]} s={[1.3, 0.72, 0.03]} m={M.tv} />
      <Box p={[-0.85, 1.05, south - 0.22]} s={[0.12, 0.95, 0.42]} m={M.hiVis} />
      <Box p={[-1.02, 1.1, south - 0.26]} s={[0.1, 0.8, 0.36]} m={M.hiVis} />

      {/* L-desk (espresso): west wall + under the window */}
      <Box p={[west + 0.4, 0.37, -0.85]} s={[0.78, 0.74, 2.8]} m={M.desk} />
      <Box p={[-0.15, 0.37, north + 0.4]} s={[1.9, 0.74, 0.78]} m={M.desk} />
      <OfficeChair p={[-0.45, -1.15]} M={M} />

      {/* desk clutter */}
      {/* laptop (open) near the south end of the west desk */}
      <group position={[west + 0.45, 0.74, 0.3]}>
        <Box p={[0, 0.01, 0]} s={[0.34, 0.02, 0.24]} m={M.silver} />
        <Box p={[0, 0.12, -0.12]} s={[0.34, 0.22, 0.02]} m={M.silver} rot={[-0.35, 0, 0]} />
        <Box p={[0, 0.12, -0.11]} s={[0.3, 0.18, 0.005]} m={M.screen} rot={[-0.35, 0, 0]} />
      </group>
      {/* monitor on the window desk */}
      <group position={[-0.1, 0.74, north + 0.45]}>
        <Box p={[0, 0.55, 0]} s={[0.7, 0.42, 0.04]} m={M.metal} />
        <Box p={[0, 0.55, 0.021]} s={[0.64, 0.36, 0.005]} m={M.screen} />
        <Box p={[0, 0.2, 0]} s={[0.06, 0.4, 0.06]} m={M.metal} />
      </group>
      {/* cereal box, sticky notes, phone */}
      <Box p={[west + 0.55, 0.86, 0.9]} s={[0.12, 0.24, 0.18]} m={M.cereal} />
      <Box p={[west + 0.3, 0.76, 0.75]} s={[0.12, 0.04, 0.12]} m={M.sticky1} />
      <Box p={[west + 0.3, 0.76, 1.0]} s={[0.12, 0.04, 0.12]} m={M.sticky2} />
      <Box p={[west + 0.62, 0.77, 1.2]} s={[0.16, 0.06, 0.22]} m={M.black} />

      {/* near the door: two guest chairs, parking sign, backpack, dog bed, trash can */}
      <GuestChair p={[east - 0.33, 1.25]} M={M} />
      <GuestChair p={[east - 0.33, 2.0]} M={M} />
      <Box p={[east - 0.18, 0.56, 0.55]} s={[0.05, 1.05, 0.62]} m={M.sign} rot={[0, 0, 0.08]} />
      <mesh position={[0.6, 0.26, 1.95]} material={M.black}>
        <boxGeometry args={[0.4, 0.5, 0.28]} />
      </mesh>
      <mesh position={[east - 0.45, 0.06, 2.4]} material={M.dogbed}>
        <cylinderGeometry args={[0.3, 0.34, 0.12, 16]} />
      </mesh>
      <mesh position={[west + 0.3, 0.2, 2.1]} material={M.trash}>
        <cylinderGeometry args={[0.15, 0.13, 0.4, 14]} />
      </mesh>
    </>
  )
}
