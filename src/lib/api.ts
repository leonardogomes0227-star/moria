import { menuItems } from '@/data/menu'
import { supabase } from './supabase'
import type { MenuItem, StoreSettings } from './types'

export const MENU_TABLE = 'menu_items'
export const SETTINGS_TABLE = 'store_settings'

interface SettingsRow {
  whatsapp: string
  hours: StoreSettings['hours']
  delivery_fee: StoreSettings['deliveryFee']
  notice: string
}

export interface MenuResult {
  items: MenuItem[]
  /** True quando caímos no menu.ts por falha de rede/erro do Supabase. */
  degraded: boolean
}

/** Cardápio: Supabase quando configurado; senão (ou em caso de erro) o seed local. */
export async function fetchMenu(): Promise<MenuResult> {
  if (!supabase) return { items: menuItems, degraded: false }
  try {
    const { data, error } = await supabase
      .from(MENU_TABLE)
      .select('*')
      .order('ordem', { ascending: true })
    if (error) throw error
    if (!data || data.length === 0) return { items: menuItems, degraded: false }
    return { items: data as MenuItem[], degraded: false }
  } catch {
    return { items: menuItems, degraded: true }
  }
}

export async function fetchSettings(): Promise<Partial<StoreSettings> | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    if (error || !data) return null
    const row = data as SettingsRow
    return {
      whatsapp: row.whatsapp,
      hours: row.hours,
      deliveryFee: row.delivery_fee,
      notice: row.notice,
    }
  } catch {
    return null
  }
}
