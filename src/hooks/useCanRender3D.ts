import { useState } from 'react'
import { usePrefersReducedMotion } from './useReducedMotion'

interface NavigatorHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function isCapable(): boolean {
  const nav = navigator as NavigatorHints
  if (nav.connection?.saveData) return false
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return false
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return false
  return hasWebGL()
}

/** Libera a cena 3D só em dispositivos capazes, sem economia de dados e sem prefers-reduced-motion. */
export function useCanRender3D(): boolean {
  const reduced = usePrefersReducedMotion()
  const [capable] = useState(isCapable)
  return capable && !reduced
}
