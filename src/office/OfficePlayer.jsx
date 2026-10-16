import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { ROOM, EYE, COLLIDERS, SPAWNS } from './OfficeWorld.jsx'
import { pickSpawn, presence } from './mvw.js'

const R = 0.3 // player radius
const JUMP = 4.2
const GRAVITY = 12

// circle-vs-rectangle push-out, same spirit as the Evans Hall collider
function collide(pos) {
  const { w, d, h } = ROOM
  const bx = w / 2 - R - 0.06
  const bz = d / 2 - R - 0.06
  pos.x = Math.max(-bx, Math.min(bx, pos.x))
  pos.z = Math.max(-bz, Math.min(bz, pos.z))
  for (const f of COLLIDERS) {
    const hw = f.w / 2 + R
    const hd = f.d / 2 + R
    const dx = pos.x - f.x
    const dz = pos.z - f.z
    if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
      // push out along the shallower axis
      const px = hw - Math.abs(dx)
      const pz = hd - Math.abs(dz)
      if (px < pz) pos.x = f.x + Math.sign(dx || 1) * hw
      else pos.z = f.z + Math.sign(dz || 1) * hd
    }
  }
}

export default function OfficePlayer({ lockRef, onLock }) {
  const { camera, gl } = useThree()
  const controls = useMemo(() => new PointerLockControls(camera, gl.domElement), [camera, gl])
  const keys = useRef({})
  const vy = useRef(0)
  const jumpY = useRef(0)
  const lastWhere = useRef('')
  const fwd = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const spawn = pickSpawn(SPAWNS)
    camera.position.set(...spawn.pos)
    camera.lookAt(...spawn.lookAt)
    lockRef.current = () => controls.lock()
    const on = () => onLock(true)
    const off = () => {
      keys.current = {}
      onLock(false)
    }
    controls.addEventListener('lock', on)
    controls.addEventListener('unlock', off)
    const down = (e) => {
      keys.current[e.code] = true
      if (e.code === 'Space') e.preventDefault()
    }
    const up = (e) => (keys.current[e.code] = false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      controls.removeEventListener('lock', on)
      controls.removeEventListener('unlock', off)
      controls.dispose()
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [camera, controls, lockRef, onLock])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const where =
      camera.position.z > ROOM.d / 2 - 1.1
        ? 'HPA Office · by the portal to Metaverse Square'
        : camera.position.x < -0.6
          ? 'HPA Office · at the desk'
          : 'HPA Office · in the office'
    if (where !== lastWhere.current) {
      lastWhere.current = where
      presence(where)
    }
    if (!controls.isLocked) return
    camera.getWorldDirection(fwd)
    fwd.y = 0
    fwd.normalize()
    const k = keys.current
    const f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0)
    const s = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0)
    const sprint = k.ShiftLeft || k.ShiftRight
    let mx = fwd.x * f - fwd.z * s
    let mz = fwd.z * f + fwd.x * s
    const l = Math.hypot(mx, mz)
    if (l > 0.001) {
      mx /= l
      mz /= l
      const speed = sprint ? 6.5 : 3.4
      const pos = { x: camera.position.x + mx * speed * dt, z: camera.position.z + mz * speed * dt }
      collide(pos)
      camera.position.x = pos.x
      camera.position.z = pos.z
    }
    // jump
    if (k.Space && jumpY.current === 0) vy.current = JUMP
    vy.current -= GRAVITY * dt
    jumpY.current = Math.max(0, jumpY.current + vy.current * dt)
    if (jumpY.current === 0) vy.current = 0
    camera.position.y = EYE + jumpY.current
  })

  return null
}
