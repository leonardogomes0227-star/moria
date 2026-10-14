import type { BotSettings, FinanceSettings } from '../types.ts'

export const defaultFinanceSettings: FinanceSettings = {
  courier_modo: 'por_entrega',
  courier_valor: 6,
  courier_dias: 22,
  taxa_cartao_pct: 3,
  imposto_pct: 6,
  meta_lucro_pct: 20,
  baixa_estoque: false,
}

export const defaultBotSettings: BotSettings = {
  ativo: false,
  nome: 'Mori',
  instrucoes: '',
  telefone_dono: '',
  modo: 'sempre',
  usd_brl: 5.5,
  modelo: 'claude-sonnet-5-5',
  limite_mensal: 100,
  avisos_status: true,
  resumo_diario: true,
}
