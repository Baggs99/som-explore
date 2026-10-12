import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import SomWorld from './SomWorld.jsx'
import SomPlayer from './SomPlayer.jsx'
import { LEVELS, baseY, EYE } from './geo.js'
import { SPAWN } from './building.js'

export default function SomApp() {
  const [locked, setLocked] = useState(false)
  const [level, setLevelState] = useState(LEVELS[SPAWN.level])
  const [where, setWhere] = useState('')
  const lockRef = useRef()
  const gotoRef = useRef()
  const onLock = useCallback((v) => setLocked(v), [])
  const onWhere = useCallback((w) => setWhere(w), [])
  const onLevel = useCallback((l) => setLevelState(l), [])

  return (
    <>
      <Canvas
        camera={{ fov: 72, near: 0.05, far: 900, position: [SPAWN.x, baseY(SPAWN.level) + EYE, SPAWN.z] }}
        dpr={[1, 1.75]}
      >
        <SomWorld />
        <SomPlayer lockRef={lockRef} gotoRef={gotoRef} onLock={onLock} onWhere={onWhere} onLevel={onLevel} />
      </Canvas>

      <div className="where">
        <span className="dot" />
        {where}
      </div>

      {/* floor selector (acts as the elevator panel) */}
      <div className="floors">
        {[...LEVELS].reverse().map((l) => (
          <button
            key={l.id}
            className={l.idx === level.idx ? 'floorbtn on' : 'floorbtn'}
            onClick={() => gotoRef.current?.(l.idx)}
            title={l.name}
          >
            {l.short}
          </button>
        ))}
      </div>

      {locked && <div className="crosshair" />}

      {!locked && (
        <div className="overlay" onClick={() => lockRef.current?.()}>
          <div className="card">
            <div className="kicker">Yale SOM · Evans Hall</div>
            <h1>All Six Floors</h1>
            <p className="sub">
              A low-res, procedurally built walk-through of Evans Hall — Lower Level through the 5th
              floor, stacked around the central courtyard. Traced from the building floor plans.
            </p>
            <button className="go">Click to walk in</button>
            <div className="keys">
              <span><b>W A S D</b> walk</span>
              <span><b>Mouse</b> look</span>
              <span><b>Shift</b> sprint</span>
              <span><b>Space</b> jump</span>
              <span><b>0&ndash;5</b> change floor</span>
              <span><b>E / Q</b> elevator up/down</span>
              <span><b>Esc</b> pause</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
