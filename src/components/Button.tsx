import { motion, useMotionValue, useSpring } from 'framer-motion'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  PointerEvent,
  ReactNode,
} from 'react'

type Variant = 'primary' | 'ghost' | 'whatsapp'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-glow hover:bg-brand-light',
  ghost:
    'border border-white/20 bg-white/5 text-white hover:border-ember hover:bg-white/10',
  whatsapp: 'bg-[#15803D] text-white hover:bg-[#16A34A]',
}

type CommonProps = {
  variant?: Variant
  children: ReactNode
  className?: string
  /** Desktop: o botão é levemente atraído pelo cursor. */
  magnetic?: boolean
}
type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

const tap = { whileTap: { scale: 0.96 } }

function useMagnet(enabled: boolean) {
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!enabled || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const onPointerLeave = () => {
    x.set(0)
    y.set(0)
  }
  return { style: { x, y }, onPointerMove, onPointerLeave }
}

export function Button(props: AnchorProps | NativeButtonProps) {
  const {
    variant = 'primary',
    className = '',
    children,
    magnetic = false,
    ...rest
  } = props
  const magnet = useMagnet(magnetic)
  const cls = `${base} ${variants[variant]} ${className}`
  if (props.href !== undefined) {
    const { href, ...anchor } = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <motion.a {...tap} {...magnet} href={href} className={cls} {...(anchor as object)}>
        {children}
      </motion.a>
    )
  }
  const { type = 'button', ...btn } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <motion.button {...tap} {...magnet} type={type} className={cls} {...(btn as object)}>
      {children}
    </motion.button>
  )
}
