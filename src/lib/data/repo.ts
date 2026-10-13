import type {
  GalleryPhoto,
  MenuItem,
  NewOrder,
  Order,
  OrderStatus,
  Review,
  StoreSettings,
} from '../types.ts'

/** Rascunho de item do cardápio (sem `id` ao criar). */
export type MenuDraft = Omit<MenuItem, 'id' | 'ordem'> & { id?: string }
export type ReviewDraft = Omit<Review, 'id'> & { id?: string }
export type PhotoDraft = Omit<GalleryPhoto, 'id'> & { id?: string }

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
  /** Envia uma imagem e devolve a URL a gravar no registro. */
  uploadImage(file: File): Promise<string>
  /** Só no modo demonstração. */
  resetDemo?: () => void
}
