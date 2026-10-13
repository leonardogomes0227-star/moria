import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { scrollToId } from '@/lib/scroll'
import { selectCount, useCart } from '@/store/cart'
import { FlameIcon } from './Icons'

/** No celular: depois de rolar o hero, um botão fixo leva ao cardápio (some quando já há itens no carrinho). */
export function MobileCta() {
  const count = useCart(selectCount)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const menu = document.getElementById('cardapio')
      const inMenu = menu
        ? menu.getBoundingClientRect().top < window.innerHeight * 0.6 &&
          menu.getBoundingClientRect().bottom > 0
        : false
      setShow(window.scrollY > 500 && !inMenu)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && count === 0 && (
        <motion.button
          type="button"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          onClick={() => scrollToId('cardapio')}
          className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-pill bg-brand-gradient px-7 py-3.5 font-display text-xl uppercase tracking-wide shadow-glow sm:hidden"
        >
          <FlameIcon size={20} /> Fazer pedido
        </motion.button>
      )}
    </AnimatePresence>
  )
}
