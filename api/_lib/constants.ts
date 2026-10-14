import type { Category, PaymentMethod } from '../../src/lib/types.ts'

/** Cópias dos valores do site (o servidor não importa código do site em tempo de execução). */
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['Pix', 'Cartão', 'Dinheiro']
export const CATEGORIES: readonly Category[] = ['Hambúrgueres', 'Tradicionais', 'Baguetes', 'Acompanhamentos', 'Molhos', 'Bebidas', 'Combos']
