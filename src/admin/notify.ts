const SOUND_KEY = 'moria-admin:sound'

export const isSoundOn = (): boolean => {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

export const setSoundOn = (on: boolean) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    /* sem armazenamento: o ajuste vale só até recarregar */
  }
}

/** Dois bipes curtos para avisar de pedido novo. */
export function beep() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.22].forEach((delay, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = i === 0 ? 880 : 1175
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.18)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.2)
    })
    window.setTimeout(() => void ctx.close(), 800)
  } catch {
    /* navegador sem áudio: o aviso visual continua */
  }
}
