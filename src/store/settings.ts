import { create } from 'zustand'
import { defaultSettings } from '@/lib/config'
import type { StoreSettings } from '@/lib/types'

interface SettingsState {
  settings: StoreSettings
  setSettings: (s: Partial<StoreSettings>) => void
}

/** Configurações da loja: começam em config.ts e podem ser sobrescritas pelo Supabase. */
export const useSettings = create<SettingsState>((set) => ({
  settings: defaultSettings,
  setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
}))
