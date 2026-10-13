import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface LayerSpec {
  name: string
  y: number
  node: React.ReactNode
}

const SEEDS = 14

/** Posições determinísticas das sementes de gergelim sobre a calota do pão. */
const seedTransforms = Array.from({ length: SEEDS }, (_, i) => {
  const a = i * 2.399963
  const r = 0.25 + ((i * 0.61803) % 1) * 0.55
  const x = Math.cos(a) * r
  const z = Math.sin(a) * r
  const y = Math.sqrt(Math.max(0, 1 - r * r)) * 0.78 + 0.03
  return { x, y, z, rot: a }
})

function Seeds() {
  return (
    <>
      {seedTransforms.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, s.y, s.z]}
          rotation={[0.5, s.rot, 0.4]}
          scale={[0.09, 0.045, 0.05]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#FFE7B8" roughness={0.5} />
        </mesh>
      ))}
    </>
  )
}

const layers: LayerSpec[] = [
  {
    name: 'paoBase',
    y: 0,
    node: (
      <mesh>
        <cylinderGeometry args={[1.02, 0.9, 0.36, 40]} />
        <meshStandardMaterial color="#C97A2B" roughness={0.65} />
      </mesh>
    ),
  },
  {
    name: 'carne',
    y: 0.36,
    node: (
      <mesh>
        <cylinderGeometry args={[1.08, 1.08, 0.34, 40]} />
        <meshStandardMaterial color="#3B1D10" roughness={0.9} metalness={0.05} />
      </mesh>
    ),
  },
  {
    name: 'queijo',
    y: 0.6,
    node: (
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2.05, 0.07, 2.05]} />
        <meshStandardMaterial
          color="#FFB400"
          roughness={0.35}
          emissive="#FF6A00"
          emissiveIntensity={0.15}
        />
      </mesh>
    ),
  },
  {
    name: 'tomate',
    y: 0.7,
    node: (
      <mesh>
        <cylinderGeometry args={[0.98, 0.98, 0.1, 36]} />
        <meshStandardMaterial color="#D61F1F" roughness={0.4} />
      </mesh>
    ),
  },
  {
    name: 'alface',
    y: 0.83,
    node: (
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.55]}>
        <torusGeometry args={[1.0, 0.16, 10, 48]} />
        <meshStandardMaterial color="#5FB33A" roughness={0.55} />
      </mesh>
    ),
  },
  {
    name: 'paoTopo',
    y: 0.93,
    node: (
      <group>
        <mesh scale={[1, 0.78, 1]}>
          <sphereGeometry args={[1.1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#D98A2E" roughness={0.5} />
        </mesh>
        <Seeds />
      </group>
    ),
  },
]

const SPREAD = 0.62
const CENTER = 0.6

interface ProceduralBurgerProps {
  /** Valor em [0,1]; 0 = montado, 1 = camadas totalmente separadas. */
  explode: () => number
}

export function ProceduralBurger({ explode }: ProceduralBurgerProps) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const current = useRef(0)

  useFrame((_, dt) => {
    current.current = THREE.MathUtils.damp(current.current, explode(), 6, dt)
    layers.forEach((layer, i) => {
      const g = refs.current[i]
      if (!g) return
      g.position.y =
        layer.y - CENTER + (i - (layers.length - 1) / 2) * SPREAD * current.current
      g.rotation.y = current.current * (i % 2 ? 0.5 : -0.5)
    })
  })

  const setRef = useMemo(
    () => layers.map((_, i) => (el: THREE.Group | null) => void (refs.current[i] = el)),
    [],
  )

  return (
    <group>
      {layers.map((layer, i) => (
        <group key={layer.name} ref={setRef[i]}>
          {layer.node}
        </group>
      ))}
    </group>
  )
}
