/** US$ por milhão de tokens. A leitura de cache custa ~10% da entrada. Usado pelo painel e pelo servidor. */
export const BOT_MODELS: Record<string, { label: string; in: number; out: number; hint: string }> = {
  'claude-opus-5-5': { label: 'Opus 5.5 — mais esperto', in: 4, out: 20, hint: 'Melhor para conversas longas e pedidos complicados. É o mais caro.' },
  'claude-sonnet-5-5': { label: 'Sonnet 5.5 — equilibrado', in: 2, out: 10, hint: 'Ótimo custo-benefício para o dia a dia.' },
  'claude-haiku-5-5': { label: 'Haiku 5.5 — mais barato', in: 0.1, out: 0.5, hint: 'Respostas simples e baratas; erra mais em pedidos complexos.' },
}

export interface TokenUsage {
  tokens_in: number
  tokens_out: number
  tokens_cache: number
}

/** Gasto estimado em reais. */
export function estimateBotCost(u: TokenUsage, model: string, usdBrl: number): number {
  const m = BOT_MODELS[model] ?? BOT_MODELS['claude-sonnet-5-5']
  const usd = (u.tokens_in * m.in + u.tokens_cache * m.in * 0.1 + u.tokens_out * m.out) / 1_000_000
  return usd * usdBrl
}
