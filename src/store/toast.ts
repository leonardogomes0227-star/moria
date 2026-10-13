import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  text: string
  tone: ToastTone
}

interface ToastState {
  toasts: Toast[]
  push: (text: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (text, tone = 'success') => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, tone }] }))
    window.setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      3200,
    )
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = (text: string, tone?: ToastTone) =>
  useToasts.getState().push(text, tone)
