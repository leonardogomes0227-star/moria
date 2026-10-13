import Lenis from 'lenis'
import { useEffect } from 'react'
import { setLenis } from '@/lib/scroll'
import { usePrefersReducedMotion } from './useReducedMotion'

export function useLenis() {
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      lerp: 0.1,
      prevent: (node) => node.hasAttribute('data-lenis-prevent'),
    })
    setLenis(lenis)
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])
}
