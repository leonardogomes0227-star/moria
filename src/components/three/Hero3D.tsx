import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EmberParticles } from './EmberParticles'
import { GlbBurger } from './GlbBurger'
import { ProceduralBurger } from './ProceduralBurger'

interface Hero3DProps {
  /** Progresso de explosão em [0,1], lido a cada frame. */
  explode: () => number
  active: boolean
  useModel: boolean
}

const AUTO_SPIN = 0.25

/** Gira devagar, responde ao ponteiro (parallax) e ao arraste horizontal. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const drag = useRef({ active: false, lastX: 0, yaw: 0, velocity: 0 })
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement
    const d = drag.current
    const down = (e: PointerEvent) => {
      d.active = true
      d.lastX = e.clientX
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!d.active) return
      d.velocity = (e.clientX - d.lastX) * 0.012
      d.yaw += d.velocity
      d.lastX = e.clientX
    }
    const up = () => {
      d.active = false
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const d = drag.current
    if (!d.active) {
      d.yaw += AUTO_SPIN * dt + d.velocity
      d.velocity *= 0.92
    }
    g.rotation.y = d.yaw + state.pointer.x * 0.35
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.28 - state.pointer.y * 0.2, 4, dt)
  })

  return <group ref={group}>{children}</group>
}

export default function Hero3D({ explode, active, useModel }: Hero3DProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.6, 6.2], fov: 34 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      style={{ touchAction: 'pan-y', cursor: 'grab' }}
      aria-label="Hambúrguer 3D interativo. Arraste para girar."
      role="img"
    >
      <ambientLight intensity={0.35} color="#FFD2A8" />
      <directionalLight position={[3, 5, 4]} intensity={2.4} color="#FFB070" />
      <pointLight position={[-4, 1.5, -2]} intensity={40} color="#D61F1F" distance={12} />
      <pointLight position={[0, -3, 3]} intensity={25} color="#FF6A1A" distance={10} />
      <Suspense fallback={null}>
        <Rig>
          {useModel ? (
            <GlbBurger explode={explode} />
          ) : (
            <ProceduralBurger explode={explode} />
          )}
        </Rig>
      </Suspense>
      <EmberParticles />
    </Canvas>
  )
}
