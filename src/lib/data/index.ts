import { isSupabaseConfigured } from '../supabase.ts'
import { localRepo } from './localRepo.ts'
import type { Repo } from './repo.ts'
import { supabaseRepo } from './supabaseRepo.ts'

/** Supabase quando há variáveis de ambiente; senão, modo demonstração local. */
export const repo: Repo = isSupabaseConfigured ? supabaseRepo : localRepo
export type { MenuDraft, PhotoDraft, ReviewDraft, Repo } from './repo.ts'
