import Lenis from 'lenis'

let instance: Lenis | null = null

export const setLenis = (l: Lenis | null) => {
  instance = l
}

/** Rola até uma âncora, com offset do header; funciona com ou sem Lenis. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (instance) instance.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
}
