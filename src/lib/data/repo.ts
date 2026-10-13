import type {
  BotConversation,
  BotSettings,
  Employee,
  Expense,
  FinanceSettings,
  GalleryPhoto,
  Ingredient,
  MenuItem,
  NewOrder,
  Order,
  OrderStatus,
  Recipe,
  Review,
  StoreSettings,
} from '../types.ts'

/** Rascunho de item do cardápio (sem `id` ao criar). */
export type MenuDraft = Omit<MenuItem, 'id' | 'ordem'> & { id?: string }
export type ReviewDraft = Omit<Review, 'id'> & { id?: string }
export type PhotoDraft = Omit<GalleryPhoto, 'id'> & { id?: string }

/** CRUD simples: `save` cria (sem id) ou atualiza (com id). */
export interface Crud<T extends { id: string }> {
  list(): Promise<T[]>
  save(draft: Omit<T, 'id'> & { id?: string }): Promise<void>
  remove(id: string): Promise<void>
}

export interface BotUsage {
  mensagens: number
  tokens_in: number
  tokens_out: number
  tokens_cache: number
}

/**
 * Contrato de dados do site e do painel. Duas implementações:
 * `supabaseRepo` (produção) e `localRepo` (demonstração, tudo no navegador).
 */
export interface Repo {
  mode: 'supabase' | 'local'
  menu: {
    list(): Promise<MenuItem[]>
    save(draft: MenuDraft, nextOrder: number): Promise<void>
    patch(
      id: string,
      patch: Partial<Pick<MenuItem, 'disponivel' | 'destaque'>>,
    ): Promise<void>
    remove(id: string): Promise<void>
    swap(a: MenuItem, b: MenuItem): Promise<void>
    importMany(items: MenuItem[]): Promise<void>
  }
  settings: {
    get(): Promise<Partial<StoreSettings> | null>
    save(settings: StoreSettings): Promise<void>
  }
  orders: {
    /** Chamado pelo site ao finalizar o pedido (público). */
    create(order: NewOrder): Promise<void>
    list(): Promise<Order[]>
    setStatus(id: string, status: OrderStatus): Promise<void>
  }
  reviews: {
    list(): Promise<Review[]>
    save(draft: ReviewDraft): Promise<void>
    remove(id: string): Promise<void>
  }
  gallery: {
    list(): Promise<GalleryPhoto[]>
    save(draft: PhotoDraft): Promise<void>
    remove(id: string): Promise<void>
  }
  finance: {
    ingredients: Crud<Ingredient>
    expenses: Crud<Expense>
    staff: Crud<Employee>
    recipes: {
      list(): Promise<Recipe[]>
      save(recipe: Recipe): Promise<void>
      remove(itemId: string): Promise<void>
    }
    settings: {
      get(): Promise<FinanceSettings>
      save(settings: FinanceSettings): Promise<void>
    }
  }
  bot: {
    settings: {
      get(): Promise<BotSettings>
      save(settings: BotSettings): Promise<void>
    }
    conversations(): Promise<BotConversation[]>
    /** Pausa o robô para um cliente (`ate`) ou devolve a conversa ao robô (`null`). */
    setHuman(telefone: string, ate: string | null): Promise<void>
    /** Consumo de IA no mês (AAAA-MM). */
    usage(month: string): Promise<BotUsage>
  }
  /** Envia uma imagem e devolve a URL a gravar no registro. */
  uploadImage(file: File): Promise<string>
  /** Só no modo demonstração. */
  resetDemo?: () => void
}
