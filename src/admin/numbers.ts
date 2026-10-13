/** Número no formato brasileiro (vírgula) → número. Vazio ou inválido vira 0. */
export const parseNum = (text: string): number => {
  const n = Number(
    text
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(\D|$))/g, '')
      .replace(',', '.'),
  )
  return Number.isFinite(n) ? n : 0
}

/** Número → texto com vírgula, sem zeros sobrando. */
export const fmtNum = (n: number, max = 4): string =>
  Number.isFinite(n) ? String(Number(n.toFixed(max))).replace('.', ',') : ''
