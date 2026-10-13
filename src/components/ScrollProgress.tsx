import { motion, useScroll, useSpring } from 'framer-motion'

/** Barra fina no topo mostrando quanto da página já foi lida. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  })
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-brand-gradient"
    />
  )
}
