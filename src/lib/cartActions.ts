import { toast } from '@/store/toast'
import { useCart, type CartLine } from '@/store/cart'

/** Mini “bolinha” que voa do botão até o ícone do carrinho (Web Animations API, sem re-render). */
function flyToCart(from: Element) {
  const target = document.getElementById('cart-button')
  if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  Object.assign(dot.style, {
    position: 'fixed',
    left: `${a.left + a.width / 2 - 10}px`,
    top: `${a.top + a.height / 2 - 10}px`,
    width: '20px',
    height: '20px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg,#D61F1F,#FF6A1A)',
    boxShadow: '0 0 18px 4px rgba(255,106,26,0.7)',
    zIndex: '90',
    pointerEvents: 'none',
  })
  document.body.appendChild(dot)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const anim = dot.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      {
        transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 60}px) scale(1.2)`,
        opacity: 1,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.2 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.4,0,0.2,1)' },
  )
  anim.onfinish = () => dot.remove()
}

/** Adiciona ao carrinho com feedback (voo até o carrinho + aviso). */
export function addToCart(line: Omit<CartLine, 'key'>, source?: Element | null) {
  useCart.getState().add(line)
  if (source) flyToCart(source)
  toast(`${line.qtd > 1 ? `${line.qtd}x ` : ''}${line.nome} no carrinho`)
}
