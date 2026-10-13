import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const CartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6" />
    <circle cx="9.5" cy="20" r="1.3" />
    <circle cx="17" cy="20" r="1.3" />
  </Svg>
)
export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)
export const WhatsappIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5z" />
    <path
      d="M9 8.5c.3 2.6 2.4 5 5.5 6l1.2-1.3-1.8-1-.8.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.8-1-1.8z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
)
export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r=".8" fill="currentColor" />
  </Svg>
)
export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.8" r="2.5" />
  </Svg>
)
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)
export const StarIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" strokeWidth="1">
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" />
  </Svg>
)
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </Svg>
)
export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
  </Svg>
)
export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)
export const MinusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)
export const ChevronIcon = ({
  dir = 'right',
  ...p
}: IconProps & { dir?: 'left' | 'right' | 'up' | 'down' }) => (
  <Svg
    {...p}
    style={{ transform: `rotate(${{ right: 0, down: 90, left: 180, up: 270 }[dir]}deg)` }}
  >
    <path d="M9 5l7 7-7 7" />
  </Svg>
)
export const FlameIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.2 1 2 2 2.2C10.5 8.5 11 5.5 12 3z" />
  </Svg>
)
export const BreadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 15.5c-1-3 1-6 4-6.5l8-1c3-.3 5 2 4.4 4.6-.4 1.6-1.6 2.6-3.2 3l-8 1.6C6.4 17.6 4.5 17 4 15.5z" />
    <path d="M9 10l1 5M13.5 9.3l1 5" />
  </Svg>
)
export const SauceIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 3h4v3l1.5 2.5V19a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V8.5L10 6z" />
    <path d="M8.5 12h7" />
  </Svg>
)
export const MeatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 4.5c3.5-.5 6 2 5.5 5.5-.4 3-3 4.5-5 6.5l-2.5 2.5a3 3 0 0 1-4.2 0l-1.3-1.3a3 3 0 0 1 0-4.2L9.5 11C11.5 9 11.5 5 14.5 4.5z" />
    <circle cx="15.5" cy="8.5" r="1.2" />
  </Svg>
)
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
)
