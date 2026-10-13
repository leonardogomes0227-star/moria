import { useEffect } from 'react'
import { setLenis } from '@/lib/scroll'
import { usePrefersReducedMotion } from './useReducedMotion'

/** Rolagem suave: o Lenis é carregado sob demanda, depois da primeira pintura. */
export function useLenis() {
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let raf = 0
    let destroy = () => {}
    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      const lenis = new Lenis({
        lerp: 0.1,
        prevent: (node) => node.hasAttribute('data-lenis-prevent'),
      })
      setLenis(lenis)
      const loop = (t: number) => {
        lenis.raf(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      destroy = () => {
        lenis.destroy()
        setLenis(null)
      }
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      destroy()
    }
  }, [reduced])
}
