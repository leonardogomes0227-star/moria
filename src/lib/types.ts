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

export interface StoreSettings {
  whatsapp: string
  hours: WeekHours
  deliveryFee: DeliveryFee
  notice: string
}

export type OrderType = 'entrega' | 'retirada'
export type PaymentMethod = 'Pix' | 'Cartão' | 'Dinheiro'

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
