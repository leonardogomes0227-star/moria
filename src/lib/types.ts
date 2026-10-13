export const CATEGORIES = [
  'Hambúrgueres',
  'Baguetes',
  'Acompanhamentos',
  'Molhos',
  'Bebidas',
  'Combos',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Addon {
  nome: string
  preco: number
}

export interface MenuItem {
  id: string
  categoria: Category
  nome: string
  descricao: string
  preco: number
  imagem: string
  destaque: boolean
  disponivel: boolean
  adicionais: Addon[]
  /** Posição no cardápio (vem do Supabase). */
  ordem?: number
}

/** Horário de um dia. `null` = fechado. Formato HH:mm; se close < open, fecha na madrugada seguinte. */
export interface DayHours {
  open: string
  close: string
}

export type WeekHours = (DayHours | null)[] // índice 0 = domingo

export type DeliveryFee = { mode: 'fixed'; amount: number } | { mode: 'tbd' }

export type OrderType = 'entrega' | 'retirada'
export type PaymentMethod = 'Pix' | 'Cartão' | 'Dinheiro'

export const PAYMENT_METHODS: readonly PaymentMethod[] = ['Pix', 'Cartão', 'Dinheiro']

export interface StoreSettings {
  whatsapp: string
  hours: WeekHours
  deliveryFee: DeliveryFee
  notice: string
  /** Pausa os pedidos pelo site (ex.: cozinha lotada), independente do horário. */
  paused: boolean
  pauseMessage: string
  payments: PaymentMethod[]
  /** Valor mínimo do subtotal para fechar o pedido (0 = sem mínimo). */
  minOrder: number
}

export type OrderStatus = 'novo' | 'preparo' | 'entrega' | 'concluido' | 'cancelado'

export interface OrderLine {
  nome: string
  qtd: number
  /** Preço unitário já com os adicionais. */
  preco: number
  adicionais: string[]
  obs: string
}

export interface Order {
  id: string
  numero: number
  criado_em: string
  status: OrderStatus
  tipo: OrderType
  cliente_nome: string
  cliente_telefone: string
  endereco: string
  pagamento: PaymentMethod
  troco: string
  obs: string
  itens: OrderLine[]
  subtotal: number
  /** `null` = taxa a combinar. */
  entrega: number | null
  total: number
}

export type NewOrder = Omit<Order, 'id' | 'numero' | 'criado_em' | 'status'>

export interface Review {
  id: string
  nome: string
  texto: string
  nota: number
  origem: string
}

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
}
