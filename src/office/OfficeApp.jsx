import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import OfficeWorld, { ROOM, EYE } from './OfficeWorld.jsx'
import OfficePlayer from './OfficePlayer.jsx'

export default function OfficeApp() {
  const [locked, setLocked] = useState(false)
  const lockRef = useRef()
  const onLock = useCallback((v) => setLocked(v), [])

  return (
    <>
      <Canvas
        camera={{ fov: 72, near: 0.05, far: 100, position: [0.9, EYE, ROOM.d / 2 - 0.7] }}
        dpr={[1, 1.75]}
      >
        <OfficeWorld />
        <OfficePlayer lockRef={lockRef} onLock={onLock} />
      </Canvas>

      <div className="where">
        <span className="dot" />
        My office · {ROOM.w} × {ROOM.d} m
      </div>

      {locked && <div className="crosshair" />}

      {!locked && (
        <div className="overlay" onClick={() => lockRef.current?.()}>
          <div className="card">
            <div className="kicker">LiDAR scan · procedural</div>
            <h1>My Office</h1>
            <p className="sub">
              A low-res, hand-built-looking room rebuilt from a phone LiDAR scan — same procedural
              styling as the Evans Hall walk-through.
            </p>
            <button className="go">Click to walk in</button>
            <div className="keys">
              <span><b>W A S D</b> walk</span>
              <span><b>Mouse</b> look</span>
              <span><b>Shift</b> sprint</span>
              <span><b>Space</b> jump</span>
              <span><b>Esc</b> pause</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
