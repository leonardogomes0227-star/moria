import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { config } from '@/lib/config'
import { scrollToId } from '@/lib/scroll'
import { whatsappUrl } from '@/lib/whatsapp'
import { selectCount, useCart } from '@/store/cart'
import { useSettings } from '@/store/settings'
import { CartIcon, CloseIcon, MenuIcon, WhatsappIcon } from './Icons'
import { Logo } from './Logo'

const links = [
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'como-funciona', label: 'Como pedir' },
  { id: 'funcionamento', label: 'Horários' },
  { id: 'feedbacks', label: 'Avaliações' },
  { id: 'localizacao', label: 'Localização' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')
  const count = useCart(selectCount)
  const setCartOpen = useCart((s) => s.setOpen)
  const { notice, whatsapp } = useSettings((s) => s.settings)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      // Seção atual: a última cujo topo já passou da altura do header.
      let current = ''
      for (const l of links) {
        const el = document.getElementById(l.id)
        if (el && el.getBoundingClientRect().top <= 140) current = l.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setMenuOpen(false)
    scrollToId(id)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {notice && (
        <p
          className="bg-brand px-4 py-1.5 text-center text-sm font-medium text-white"
          role="status"
        >
          {notice}
        </p>
      )}
      <div
        className={`transition-colors duration-300 ${
          scrolled || menuOpen
            ? 'border-b border-line bg-bg/75 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault()
              go('inicio')
            }}
            aria-label={`${config.name} — início`}
          >
            <Logo size={40} />
          </a>

          <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.id)
                }}
                aria-current={active === l.id ? 'true' : undefined}
                className={`relative py-1 text-sm font-medium transition-colors hover:text-ember ${
                  active === l.id ? 'text-ember' : 'text-white/80'
                }`}
              >
                {l.label}
                {active === l.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              id="cart-button"
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-white transition-colors hover:border-ember"
            >
              <CartIcon size={22} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <a
              href={whatsappUrl(whatsapp, config.messages.headerWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-pill bg-[#1FA855] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#25C063] sm:inline-flex"
            >
              <WhatsappIcon size={18} /> Pedir no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface lg:hidden"
            >
              {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="menu-mobile"
              aria-label="Menu mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <ul className="container-x flex flex-col gap-1 pb-5 pt-2">
                {links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        go(l.id)
                      }}
                      className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-white/5"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2 sm:hidden">
                  <a
                    href={whatsappUrl(whatsapp, config.messages.headerWhatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-pill bg-[#1FA855] px-4 py-3 font-semibold"
                  >
                    <WhatsappIcon size={20} /> Pedir no WhatsApp
                  </a>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
