import { isSupabaseConfigured } from './supabase'

/**
 * Site de demonstração para o dono: sem Supabase, ou com `VITE_DEMO=1` (para a demonstração com o banco ligado).
 * Só controla os atalhos e convites (robô, painel, central de demonstração).
 */
export const isDemoSite: boolean = !isSupabaseConfigured || import.meta.env.VITE_DEMO === '1'
