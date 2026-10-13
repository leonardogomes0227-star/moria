import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_URL } from './useBurgerModel'

interface GlbBurgerProps {
  explode: () => number
}

/** Cada filho direto da cena do .glb vira uma camada (ordenada de baixo para cima). */
export function GlbBurger({ explode }: GlbBurgerProps) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])
  const current = useRef(0)

  const layers = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = 2.4 / Math.max(size.x, size.y, size.z)
    model.scale.setScalar(scale)
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    return [...model.children]
      .sort((a, b) => a.position.y - b.position.y)
      .map((node) => ({ node, baseY: node.position.y }))
  }, [model])

  useFrame((_, dt) => {
    current.current = THREE.MathUtils.damp(current.current, explode(), 6, dt)
    layers.forEach(({ node, baseY }, i) => {
      node.position.y = baseY + (i - (layers.length - 1) / 2) * 0.5 * current.current
    })
  })

  return <primitive object={model} />
}
