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
  /** Custo do adicional para a loja (R$), usado no cálculo de lucro. */
  custo?: number
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

export type OrderOrigin = 'site' | 'whatsapp'

export type OrderStatus = 'novo' | 'preparo' | 'entrega' | 'concluido' | 'cancelado'

export interface OrderLine {
  /** Id do item no cardápio (liga o pedido à ficha técnica). Pedidos antigos podem não ter. */
  item_id?: string
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
  origem: OrderOrigin
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

export type NewOrder = Omit<
  Order,
  'id' | 'numero' | 'criado_em' | 'status' | 'origem'
> & {
  origem?: OrderOrigin
}

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

/* ───────── Financeiro ───────── */

export const UNITS = ['un', 'g', 'kg', 'ml', 'L', 'fatia', 'porção'] as const
export type Unit = (typeof UNITS)[number]

export const INGREDIENT_GROUPS = [
  'Carnes',
  'Pães',
  'Laticínios',
  'Hortifruti',
  'Molhos',
  'Fritura',
  'Bebidas',
  'Embalagens',
  'Outros',
] as const
export type IngredientGroup = (typeof INGREDIENT_GROUPS)[number]

/** Insumo/ingrediente. Custo unitário = preço pago ÷ quantidade comprada. */
export interface Ingredient {
  id: string
  nome: string
  grupo: IngredientGroup
  unidade: Unit
  preco_compra: number
  qtd_compra: number
  estoque: number
  estoque_min: number
}

/** Linha de uma ficha técnica: um insumo ou outro item do cardápio (usado em combos). */
export interface RecipeLine {
  tipo: 'ingrediente' | 'item'
  ref: string
  qtd: number
}

export interface Recipe {
  item_id: string
  linhas: RecipeLine[]
}

export const EXPENSE_GROUPS = [
  'Aluguel',
  'Energia',
  'Água',
  'Gás',
  'Internet',
  'Contador',
  'Marketing',
  'Manutenção',
  'Taxas e sistemas',
  'Outros',
] as const
export type ExpenseGroup = (typeof EXPENSE_GROUPS)[number]

export interface Expense {
  id: string
  nome: string
  grupo: ExpenseGroup
  valor: number
  /** `mensal` repete todo mês; `unica` vale só no mês indicado. */
  recorrencia: 'mensal' | 'unica'
  /** AAAA-MM (só para `unica`). */
  mes: string
}

export type PayMode = 'mensal' | 'diaria' | 'hora'

export interface Employee {
  id: string
  nome: string
  funcao: string
  pagamento: PayMode
  valor: number
  /** Dias trabalhados no mês (para diária). */
  dias_mes: number
  /** Horas no mês (para pagamento por hora). */
  horas_mes: number
  /** Encargos (FGTS, férias, 13º…) em % sobre o pagamento. */
  encargos_pct: number
  ativo: boolean
}

export type CourierMode = 'por_entrega' | 'diaria' | 'mensal'

export interface FinanceSettings {
  courier_modo: CourierMode
  courier_valor: number
  /** Dias trabalhados no mês (para diária). */
  courier_dias: number
  taxa_cartao_pct: number
  imposto_pct: number
  /** Lucro líquido desejado sobre o preço (%), usado no preço sugerido. */
  meta_lucro_pct: number
}

/* ───────── Assistente de WhatsApp (IA) ───────── */

export interface BotSettings {
  ativo: boolean
  nome: string
  /** Regras extras e respostas prontas escritas pelo dono (chave Pix, promoções, avisos…). */
  instrucoes: string
  /** WhatsApp do dono (55DDD…) que recebe aviso quando o cliente pede atendente. */
  telefone_dono: string
  /** `sempre`: responde 24h. `fora_do_horario`: só quando a loja está fechada. */
  modo: 'sempre' | 'fora_do_horario'
  /** Cotação usada só para estimar o gasto com IA em reais. */
  usd_brl: number
  modelo: string
}

export interface BotMessage {
  id: string
  telefone: string
  papel: 'cliente' | 'assistente' | 'atendente'
  texto: string
  criado_em: string
  tokens_in: number
  tokens_out: number
  tokens_cache: number
}

export interface BotConversation {
  telefone: string
  nome: string
  ultima_em: string
  /** Atendimento humano: o robô fica em silêncio até esta data. */
  humano_ate: string | null
  mensagens: BotMessage[]
}
