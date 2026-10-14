/** Só os dígitos. */
export const digits = (s: string): string => s.replace(/\D/g, '')

/**
 * Telefone no formato do WhatsApp (55 + DDD + número). Aceita "(67) 99802-2571", "67998022571" etc.
 * Devolve `null` se não parecer um telefone brasileiro.
 */
export function toWaPhone(raw: string): string | null {
  const d = digits(raw)
  if (d.length === 10 || d.length === 11) return `55${d}`
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) return d
  return null
}

/** As duas formas em que o mesmo celular brasileiro aparece (com e sem o 9 depois do DDD). */
export function phoneVariants(raw: string): string[] {
  const p = toWaPhone(raw)
  if (!p) return []
  const ddd = p.slice(2, 4)
  const rest = p.slice(4)
  if (rest.length === 9 && rest.startsWith('9')) return [p, `55${ddd}${rest.slice(1)}`]
  if (rest.length === 8) return [p, `55${ddd}9${rest}`]
  return [p]
}

/** Mesmo telefone, ignorando o 9 extra. */
export function samePhone(a: string, b: string): boolean {
  const va = phoneVariants(a)
  const vb = phoneVariants(b)
  return va.some((x) => vb.includes(x))
}
