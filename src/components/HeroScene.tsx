import { useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useCanRender3D } from '@/hooks/useCanRender3D'
import { useInView } from '@/hooks/useInView'
import { BurgerFallback } from './BurgerFallback'

const Hero3D = lazy(() => import('./three/Hero3D'))

/** Sem interação, a cena 3D entra após este tempo (a primeira interação antecipa). */
const MOUNT_DELAY_MS = 4000
const INTERACTION_EVENTS = [
  'pointerdown',
  'touchstart',
  'wheel',
  'keydown',
  'scroll',
] as const

/** Progresso de rolagem do hero → "explosão" (0 montado, pico no meio, remonta ao sair). */
function useExplode() {
  const { scrollY } = useScroll()
  const explode = useMotionValue(0)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const p = Math.min(1, Math.max(0, y / (window.innerHeight * 0.9)))
    explode.set(Math.sin(p * Math.PI))
  })
  return explode
}

export function HeroScene() {
  const can3D = useCanRender3D()
  const [ref, inView] = useInView<HTMLDivElement>()
  const explode = useExplode()
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)

  // O bundle 3D só é buscado após a primeira interação (ou um atraso), para não pesar no LCP/TBT.
  useEffect(() => {
    if (!can3D) return
    const start = () => setMount(true)
    INTERACTION_EVENTS.forEach((e) =>
      window.addEventListener(e, start, { once: true, passive: true }),
    )
    const timer = window.setTimeout(start, MOUNT_DELAY_MS)
    return () => {
      INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, start))
      window.clearTimeout(timer)
    }
  }, [can3D])

  return (
    <div ref={ref} className="relative h-full w-full">
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      >
        <BurgerFallback className="h-full w-full" />
      </div>
      {can3D && mount && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          <Suspense fallback={null}>
            <Hero3D
              explode={() => explode.get()}
              active={inView}

              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
