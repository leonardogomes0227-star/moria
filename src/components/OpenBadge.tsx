import { useOpenNow } from '@/hooks/useOpenNow'

export function OpenBadge({
  className = '',
  detailed = false,
}: {
  className?: string
  detailed?: boolean
}) {
  const { open, label } = useOpenNow()
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-bold ${
        open ? 'bg-[#1FA855]/15 text-[#4ADE80]' : 'bg-brand/15 text-[#FF8A8A]'
      } ${className}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${open ? 'animate-pulse bg-[#4ADE80]' : 'bg-[#FF6B6B]'}`}
      />
      {detailed ? label : open ? 'Aberto agora' : 'Fechado'}
    </span>
  )
}
