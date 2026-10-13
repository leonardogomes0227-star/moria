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
export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  </Svg>
)
export const ReceiptIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
  </Svg>
)
export const BurgerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11a8 6 0 0 1 16 0z" />
    <path d="M3 14h18M5 17h14a0 0 0 0 1 0 0 2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
  </Svg>
)
export const SettingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.7a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
  </Svg>
)
export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
  </Svg>
)
export const HelpIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8M12 17h.01" />
  </Svg>
)
export const PrinterIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2M7 14h10v6H7z" />
  </Svg>
)
export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Svg>
)
export const BellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" />
  </Svg>
)
export const CoinIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.8 9.2c-.5-.9-1.5-1.4-2.8-1.4-1.6 0-2.7.8-2.7 2 0 3 5.6 1.4 5.6 4.3 0 1.2-1.2 2.1-2.9 2.1-1.4 0-2.5-.6-3-1.6M12 6.5v1.3M12 16.2v1.3" />
  </Svg>
)
export const BotIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.5V17H6.5A2.5 2.5 0 0 1 4 14.5z" />
    <path d="M9 10.5h.01M15 10.5h.01M9.5 13.2c1.4 1 3.6 1 5 0" />
  </Svg>
)
export const MoreIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="18" cy="12" r="1.2" fill="currentColor" />
  </Svg>
)
export const DownloadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
  </Svg>
)
export const SendIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12l16-8-6 16-2.5-6.5z" />
  </Svg>
)
