import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { EYE, LEVELS, baseY } from './geo.js'
import { MAX_STEP } from '../layout.js'
import { SPAWN, collide, floorHeight, locate, inCore } from './building.js'

const CROUCH_EYE = 1.05
const JUMP_SPEED = 4.2
const GRAVITY = 12

// WASD move, mouse look, Shift sprint, Space jump, C crouch.
// Floor travel: inside an elevator core press E (up) / Q (down); or press 0-5 anywhere to jump
// to a floor (0 = Lower Level). The camera rides smoothly to the new level.
export default function SomPlayer({ lockRef, gotoRef, onLock, onWhere, onLevel }) {
  const { camera, gl } = useThree()
  const controls = useMemo(() => new PointerLockControls(camera, gl.domElement), [camera, gl])
  const keys = useRef({})
  const where = useRef('')
  const level = useRef(SPAWN.level)
  const eye = useRef(EYE)
  const floorY = useRef(baseY(SPAWN.level))
  const devY = useRef(null)
  const jumpY = useRef(0)
  const vy = useRef(0)
  const fwd = useMemo(() => new THREE.Vector3(), [])

  const setLevel = (idx) => {
    const n = Math.max(0, Math.min(LEVELS.length - 1, idx))
    if (n === level.current) return
    level.current = n
    onLevel?.(LEVELS[n])
  }

  useEffect(() => {
    camera.position.set(SPAWN.x, baseY(SPAWN.level) + EYE, SPAWN.z)
    camera.rotation.set(0, 0, 0)
    onLevel?.(LEVELS[SPAWN.level])
    lockRef.current = () => controls.lock()
    if (gotoRef) gotoRef.current = setLevel
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
      if (!controls.isLocked) return
      if (/^Digit[0-5]$/.test(e.code)) setLevel(Number(e.code.slice(5)))
      if (e.code === 'KeyE' && inCore(camera.position.x, camera.position.z)) setLevel(level.current + 1)
      if (e.code === 'KeyQ' && inCore(camera.position.x, camera.position.z)) setLevel(level.current - 1)
    }
    const up = (e) => (keys.current[e.code] = false)
    const blur = () => (keys.current = {})
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      controls.removeEventListener('lock', on)
      controls.removeEventListener('unlock', off)
      controls.dispose()
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [camera, controls, lockRef, gotoRef, onLock, onLevel])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    // dev only: teleport for screenshots via <body data-go="[x, z, yawDeg, pitchDeg, level]">
    if (import.meta.env.DEV && document.body.dataset.go) {
      const [x, z, yaw = 0, pitch = 0, lvl = level.current, y = null] = JSON.parse(document.body.dataset.go)
      delete document.body.dataset.go
      level.current = lvl
      onLevel?.(LEVELS[lvl])
      floorY.current = baseY(lvl)
      devY.current = y
      camera.position.set(x, y ?? baseY(lvl) + EYE, z)
      camera.rotation.set((pitch * Math.PI) / 180, (yaw * Math.PI) / 180, 0, 'YXZ')
    }
    const active = controls.isLocked
    camera.getWorldDirection(fwd)
    fwd.y = 0
    fwd.normalize()

    const k = keys.current
    let f = 0
    let s = 0
    let sprint = false
    if (active) {
      f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0)
      s = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0)
      sprint = k.ShiftLeft || k.ShiftRight
    }
    let mx = fwd.x * f - fwd.z * s
    let mz = fwd.z * f + fwd.x * s
    const l = Math.hypot(mx, mz)
    if (l > 0.05) {
      if (l > 1) {
        mx /= l
        mz /= l
      }
      const crouching = active && k.KeyC
      const speed = crouching ? 2.4 : sprint ? 9.5 : 5.5
      const pos = { x: camera.position.x + mx * speed * dt, z: camera.position.z + mz * speed * dt }
      collide(pos, level.current)
      // risers (floor-2 classrooms): step up one at a time, anything taller acts like a wall
      const lvl = level.current
      const cur = floorHeight(camera.position.x, camera.position.z, lvl)
      if (floorHeight(pos.x, pos.z, lvl) - cur <= MAX_STEP) {
        camera.position.x = pos.x
        camera.position.z = pos.z
      } else if (floorHeight(pos.x, camera.position.z, lvl) - cur <= MAX_STEP) {
        camera.position.x = pos.x
      } else if (floorHeight(camera.position.x, pos.z, lvl) - cur <= MAX_STEP) {
        camera.position.z = pos.z
      }
    }

    const wantJump = active && k.Space
    if (active && wantJump && jumpY.current === 0) vy.current = JUMP_SPEED
    vy.current -= GRAVITY * dt
    jumpY.current = Math.max(0, jumpY.current + vy.current * dt)
    if (jumpY.current === 0) vy.current = 0
    const eyeTarget = active && k.KeyC ? CROUCH_EYE : EYE
    eye.current += (eyeTarget - eye.current) * Math.min(1, dt * 12)
    const fy = floorHeight(camera.position.x, camera.position.z, level.current)
    floorY.current += (fy - floorY.current) * Math.min(1, dt * 8) // smooth elevator ride + steps
    camera.position.y = devY.current ?? floorY.current + eye.current + jumpY.current

    const w = locate(camera.position.x, camera.position.z, level.current)
    if (w !== where.current) {
      where.current = w
      onWhere(w)
    }
  })
  return null
}
