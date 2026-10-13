import { useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useCanRender3D } from '@/hooks/useCanRender3D'
import { useInView } from '@/hooks/useInView'
import { useHasModel } from './three/useBurgerModel'
import { BurgerFallback } from './BurgerFallback'

const Hero3D = lazy(() => import('./three/Hero3D'))

const fallback = <BurgerFallback className="h-full w-full" />

/** Progresso de rolagem do hero → "explosão" (0 montado, pico no meio, remonta ao sair). */
function useExplode() {
  const { scrollY } = useScroll()
  const explode = useMotionValue(0)
  const update = (y: number) => {
    const p = Math.min(1, Math.max(0, y / (window.innerHeight * 0.9)))
    explode.set(Math.sin(p * Math.PI))
  }
  useMotionValueEvent(scrollY, 'change', update)
  return explode
}

export function HeroScene() {
  const can3D = useCanRender3D()
  const [ref, inView] = useInView<HTMLDivElement>()
  const explode = useExplode()
  const hasModel = useHasModel()
  const [mount, setMount] = useState(false)

  // Adia o carregamento do bundle 3D para não competir com o LCP.
  useEffect(() => {
    if (!can3D) return
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600))
    const id = idle(() => setMount(true))
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [can3D])

  return (
    <div ref={ref} className="relative h-full w-full">
      {can3D && mount ? (
        <Suspense fallback={fallback}>
          <Hero3D explode={() => explode.get()} active={inView} useModel={hasModel} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}
