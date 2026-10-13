import { CartBar } from '@/components/CartBar'
import { CartDrawer } from '@/components/CartDrawer'
import { MobileCta } from '@/components/MobileCta'
import { Toaster } from '@/components/Toaster'
import { Footer } from '@/sections/Footer'

export default function Overlays() {
  return (
    <>
      <Footer />
      <CartBar />
      <MobileCta />
      <CartDrawer />
      <Toaster />
    </>
  )
}
