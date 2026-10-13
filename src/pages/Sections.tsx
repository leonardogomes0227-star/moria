import { useState } from 'react'
import { ItemModal } from '@/components/ItemModal'
import { useMenu } from '@/hooks/useMenu'
import type { MenuItem } from '@/lib/types'
import { Categories } from '@/sections/Categories'
import { ComboSpotlight } from '@/sections/ComboSpotlight'
import { Favorites } from '@/sections/Favorites'
import { FinalCta } from '@/sections/FinalCta'
import { Gallery } from '@/sections/Gallery'
import { Highlights } from '@/sections/Highlights'
import { Hours } from '@/sections/Hours'
import { HowItWorks } from '@/sections/HowItWorks'
import { InstagramCta } from '@/sections/InstagramCta'
import { Location } from '@/sections/Location'
import { Menu } from '@/sections/Menu'
import { Reviews } from '@/sections/Reviews'
import { Story } from '@/sections/Story'

/** Seções abaixo da dobra: ficam em um chunk separado para aliviar o carregamento inicial. */
export default function Sections() {
  const menu = useMenu()
  const [selected, setSelected] = useState<MenuItem | null>(null)

  return (
    <>
      <Categories />
      <Favorites items={menu.items} onOpen={setSelected} />
      <Menu {...menu} onOpen={setSelected} />
      <ComboSpotlight />
      <Highlights />
      <Story />
      <HowItWorks />
      <Reviews />
      <Gallery />
      <Hours />
      <Location />
      <InstagramCta />
      <FinalCta />
      <ItemModal item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
