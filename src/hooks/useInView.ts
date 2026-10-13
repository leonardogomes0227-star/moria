import { useEffect, useRef, useState } from 'react'

/** True enquanto o elemento está (quase) visível; usado para pausar o render 3D. */
export function useInView<T extends Element>(rootMargin = '100px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return [ref, inView] as const
}
