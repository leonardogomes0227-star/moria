import type { BotSettings, MenuItem, NewOrder, Order, StoreSettings } from '../../src/lib/types.ts'

/** Tudo que o assistente precisa saber da loja em uma conversa. */
export interface StoreInfo {
  name: string
  address: string
  instagram: string
  timezone: string
  settings: StoreSettings
  bot: BotSettings
  menu: MenuItem[]
  /** Loja aberta agora (pelo horário configurado). */
  open: boolean
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface Usage {
  tokens_in: number
  tokens_out: number
  tokens_cache: number
}

/** Persistência usada pelo assistente. Em produção é o Supabase; nos testes, memória. */
export interface BotStore {
  loadStore(): Promise<StoreInfo>
  /** Últimas mensagens (texto) da conversa, da mais antiga para a mais nova. */
  history(phone: string, limit: number): Promise<ChatTurn[]>
  createOrder(order: NewOrder): Promise<{ numero: number }>
  /** Pedidos mais recentes DESTE telefone. */
  ordersOf(phone: string, limit: number): Promise<Pick<Order, 'numero' | 'status' | 'tipo' | 'total' | 'criado_em' | 'itens'>[]>
  /** Pausa o robô para este cliente por `hours` horas e avisa o dono. */
  requestHuman(phone: string, customerName: string, reason: string, hours: number): Promise<void>
}

export type { BotSettings, MenuItem, NewOrder, Order, StoreSettings }
