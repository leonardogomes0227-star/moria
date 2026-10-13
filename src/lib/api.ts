import { gallery as seedGallery } from '@/data/gallery'
import { menuItems } from '@/data/menu'
import { reviews as seedReviews } from '@/data/reviews'
import { repo } from './data'
import type { GalleryPhoto, MenuItem, Review, StoreSettings } from './types'

export interface MenuResult {
  items: MenuItem[]
  /** True quando caímos no menu.ts por falha de rede/erro do Supabase. */
  degraded: boolean
}

/** Cardápio público: banco/demo; no Supabase vazio ou com erro, cai no seed local. */
export async function fetchMenu(): Promise<MenuResult> {
  try {
    const items = await repo.menu.list()
    if (items.length === 0 && repo.mode === 'supabase')
      return { items: menuItems, degraded: false }
    return { items, degraded: false }
  } catch {
    return { items: menuItems, degraded: true }
  }
}

export async function fetchSettings(): Promise<Partial<StoreSettings> | null> {
  try {
    return await repo.settings.get()
  } catch {
    return null
  }
}

export async function fetchReviews(): Promise<Review[]> {
  try {
    const list = await repo.reviews.list()
    return list.length > 0 || repo.mode === 'local' ? list : seedReviews
  } catch {
    return seedReviews
  }
}

export async function fetchGallery(): Promise<GalleryPhoto[]> {
  try {
    const list = await repo.gallery.list()
    return list.length > 0 || repo.mode === 'local' ? list : seedGallery
  } catch {
    return seedGallery
  }
}
