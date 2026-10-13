import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const COUNT = 90

const frac = (n: number) => n - Math.floor(n)
const hash = (i: number, salt: number) =>
  frac(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453)

/** Brasas subindo ao redor do hambúrguer (um único draw call). */
export function EmberParticles() {
  const points = useRef<THREE.Points>(null)

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const a = hash(i, 1) * Math.PI * 2
      const r = 0.8 + hash(i, 2) * 2.2
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = -2 + hash(i, 3) * 5.5
      positions[i * 3 + 2] = Math.sin(a) * r * 0.6
      speeds[i] = 0.25 + hash(i, 4) * 0.6
    }
    return { positions, speeds }
  }, [])

  useFrame((state, dt) => {
    const attr = points.current?.geometry.getAttribute('position') as
      THREE.BufferAttribute | undefined
    if (!attr) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      let y = attr.getY(i) + speeds[i] * dt
      if (y > 3.5) y = -2.5
      attr.setY(i, y)
      attr.setX(i, attr.getX(i) + Math.sin(t * 0.8 + i) * 0.1 * dt)
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FF7A22"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
