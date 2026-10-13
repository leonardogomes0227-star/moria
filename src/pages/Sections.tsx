import { Gallery } from '@/sections/Gallery'
import { Highlights } from '@/sections/Highlights'
import { Hours } from '@/sections/Hours'
import { HowItWorks } from '@/sections/HowItWorks'
import { Location } from '@/sections/Location'
import { Menu } from '@/sections/Menu'
import { Reviews } from '@/sections/Reviews'

/** Seções abaixo da dobra: ficam em um chunk separado para aliviar o carregamento inicial. */
export default function Sections() {
  return (
    <>
      <Highlights />
      <Menu />
      <HowItWorks />
      <Hours />
      <Reviews />
      <Gallery />
      <Location />
    </>
  )
}
