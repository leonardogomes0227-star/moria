import { AnimatePresence, motion } from 'framer-motion'
import { formatPrice } from '@/lib/format'
import { selectCount, selectSubtotal, useCart } from '@/store/cart'
import { CartIcon } from './Icons'

/** Barra fixa no mobile com o resumo do carrinho (atalho para o checkout). */
export function CartBar() {
  const count = useCart(selectCount)
  const subtotal = useCart(selectSubtotal)
  const isOpen = useCart((s) => s.isOpen)
  const setOpen = useCart((s) => s.setOpen)

  return (
    <AnimatePresence>
      {count > 0 && !isOpen && (
        <motion.button
          type="button"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          onClick={() => setOpen(true)}
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-pill bg-brand px-5 py-3.5 font-semibold shadow-glow sm:hidden"
        >
          <span className="flex items-center gap-2">
            <CartIcon size={20} /> Ver carrinho · {count} {count === 1 ? 'item' : 'itens'}
          </span>
          <span>{formatPrice(subtotal)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
