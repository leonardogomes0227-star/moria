import { useState } from 'react'
import { ItemModal } from '@/components/ItemModal'
import { useMenu } from '@/hooks/useMenu'
import type { MenuItem } from '@/lib/types'
import { Favorites } from '@/sections/Favorites'
import { Gallery } from '@/sections/Gallery'
import { Highlights } from '@/sections/Highlights'
import { InstagramCta } from '@/sections/InstagramCta'
import { Hours } from '@/sections/Hours'
import { HowItWorks } from '@/sections/HowItWorks'
import { Location } from '@/sections/Location'
import { Menu } from '@/sections/Menu'
import { Promo } from '@/sections/Promo'
import { Reviews } from '@/sections/Reviews'

/** Seções abaixo da dobra: ficam em um chunk separado para aliviar o carregamento inicial. */
export default function Sections() {
  const menu = useMenu()
  const [selected, setSelected] = useState<MenuItem | null>(null)

  return (
    <>
      <Favorites items={menu.items} onOpen={setSelected} />
      <Highlights />
      <Menu {...menu} onOpen={setSelected} />
      <Promo />
      <HowItWorks />
      <Hours />
      <Reviews />
      <Gallery />
      <InstagramCta />
      <Location />
      <ItemModal item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
