import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import data from './office-voxels.json'

// A chunky, low-res rendering of a LiDAR office scan: every voxel is one little
// colored cube, drawn in a single instanced draw call. Same "endearing low-res"
// spirit as the Evans Hall walk-through, just built from real scan data.

function Voxels({ maxY }) {
  const ref = useRef()
  const { voxelSize, voxels } = data

  // optional ceiling cull for a "dollhouse" view: drop voxels above maxY
  const shown = useMemo(() => (maxY ? voxels.filter((v) => v[1] <= maxY) : voxels), [voxels, maxY])

  const geo = useMemo(() => new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize), [voxelSize])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 }), [])

  useLayoutEffect(() => {
    const mesh = ref.current
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    shown.forEach((v, i) => {
      m.setPosition(v[0], v[1], v[2])
      mesh.setMatrixAt(i, m)
      c.setRGB(v[3] / 255, v[4] / 255, v[5] / 255)
      c.convertSRGBToLinear()
      mesh.setColorAt(i, c)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [shown])

  return <instancedMesh key={shown.length} ref={ref} args={[geo, mat, shown.length]} castShadow receiveShadow />
}

function Controls({ target }) {
  const { camera, gl } = useThree()
  const ref = useRef()
  useLayoutEffect(() => {
    const c = new OrbitControls(camera, gl.domElement)
    c.target.set(...target)
    c.enableDamping = true
    c.dampingFactor = 0.08
    c.maxDistance = 18
    c.minDistance = 1
    ref.current = c
    let raf
    const loop = () => {
      c.update()
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      c.dispose()
    }
  }, [camera, gl, target])
  return null
}

export default function OfficeScene() {
  const { room, count } = data
  const [ceiling, setCeiling] = useState(true)
  const maxY = ceiling ? room.h * 0.72 : 0 // cut the top of the room for a dollhouse view
  // look down into the room from an outside-above corner
  const [cx, cy, cz] = [0, room.h * 0.25, 0]
  const start = useMemo(() => [room.w * 0.95, room.h * 1.35, room.d * 0.95], [room])

  return (
    <>
      <Canvas
        shadows
        camera={{ fov: 60, near: 0.05, far: 200, position: start }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
        onCreated={({ scene }) => (scene.background = new THREE.Color('#1a1b1e'))}
      >
        <hemisphereLight args={['#ffffff', '#44474d', 0.9]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 8, 5]} intensity={1.1} castShadow />
        <Voxels maxY={maxY} />
        <gridHelper args={[Math.max(room.w, room.d) * 1.6, 24, '#3a3d42', '#2a2c30']} position={[0, 0, 0]} />
        <Controls target={[cx, cy, cz]} />
      </Canvas>

      <div className="where">
        <span className="dot" />
        Office scan · {room.w} × {room.d} m, {room.h} m ceiling
      </div>

      <div className="mapwrap">
        <div style={panel}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Low-res office</div>
          <div>{count.toLocaleString()} voxels @ {data.voxelSize * 100} cm</div>
          <div style={{ opacity: 0.7, margin: '6px 0' }}>drag to orbit · scroll to zoom</div>
          <button style={btn} onClick={() => setCeiling((c) => !c)}>
            {ceiling ? 'show ceiling' : 'hide ceiling (dollhouse)'}
          </button>
        </div>
      </div>
    </>
  )
}

const panel = {
  background: 'rgba(20,21,24,0.82)',
  color: '#eaeaea',
  font: '12px/1.4 ui-sans-serif, system-ui, sans-serif',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
}

const btn = {
  background: 'rgba(255,255,255,0.08)',
  color: '#eaeaea',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '5px 9px',
  font: '12px ui-sans-serif, system-ui, sans-serif',
  cursor: 'pointer',
}
