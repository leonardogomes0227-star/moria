import { CartBar } from '@/components/CartBar'
import { CartDrawer } from '@/components/CartDrawer'
import { Toaster } from '@/components/Toaster'
import { Footer } from '@/sections/Footer'

export default function Overlays() {
  return (
    <>
      <Footer />
      <CartBar />
      <CartDrawer />
      <Toaster />
    </>
  )
}
