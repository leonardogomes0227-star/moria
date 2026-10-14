/**
 * Divide a resposta em até `max` mensagens curtas (como uma pessoa digitando no WhatsApp).
 * Quebra nas linhas em branco; se houver mais pedaços que o limite, junta os últimos.
 */
export function splitReply(text: string, max = 3): string[] {
  const parts = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length <= max) return parts.length ? parts : [text.trim()].filter(Boolean)
  return [...parts.slice(0, max - 1), parts.slice(max - 1).join('\n\n')]
}

/** Pausa proporcional ao tamanho da mensagem, entre 0,8 s e 2,5 s. */
export const typingDelay = (text: string): number => Math.min(2500, Math.max(800, text.length * 25))
