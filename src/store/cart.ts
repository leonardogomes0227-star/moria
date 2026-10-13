import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Addon, OrderType, PaymentMethod } from '@/lib/types'

export interface CartLine {
  key: string
  itemId: string
  nome: string
  preco: number
  adicionais: Addon[]
  qtd: number
  obs: string
}

export interface Checkout {
  tipo: OrderType
  nome: string
  telefone: string
  endereco: string
  pagamento: PaymentMethod
  troco: string
  obs: string
}

interface CartState {
  lines: CartLine[]
  checkout: Checkout
  isOpen: boolean
  add: (line: Omit<CartLine, 'key'>) => void
  setQty: (key: string, qtd: number) => void
  remove: (key: string) => void
  setCheckout: (patch: Partial<Checkout>) => void
  finishOrder: () => void
  setOpen: (open: boolean) => void
}

const lineKey = (l: Omit<CartLine, 'key'>) =>
  [
    l.itemId,
    l.adicionais
      .map((a) => a.nome)
      .sort()
      .join('+'),
    l.obs.trim().toLowerCase(),
  ].join('|')

export const unitPrice = (l: Pick<CartLine, 'preco' | 'adicionais'>) =>
  l.preco + l.adicionais.reduce((sum, a) => sum + a.preco, 0)

export const lineTotal = (l: CartLine) => unitPrice(l) * l.qtd

const emptyCheckout: Checkout = {
  tipo: 'entrega',
  nome: '',
  telefone: '',
  endereco: '',
  pagamento: 'Pix',
  troco: '',
  obs: '',
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      checkout: emptyCheckout,
      isOpen: false,
      add: (line) =>
        set((state) => {
          const key = lineKey(line)
          const exists = state.lines.some((l) => l.key === key)
          return {
            lines: exists
              ? state.lines.map((l) =>
                  l.key === key ? { ...l, qtd: l.qtd + line.qtd } : l,
                )
              : [...state.lines, { ...line, key }],
          }
        }),
      setQty: (key, qtd) =>
        set((state) => ({
          lines:
            qtd <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, qtd } : l)),
        })),
      remove: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      setCheckout: (patch) =>
        set((state) => ({ checkout: { ...state.checkout, ...patch } })),
      finishOrder: () =>
        set((state) => ({
          lines: [],
          isOpen: false,
          checkout: { ...state.checkout, obs: '', troco: '' },
        })),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'moria-cart-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines, checkout: state.checkout }),
    },
  ),
)

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qtd, 0)
export const selectSubtotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + lineTotal(l), 0)
