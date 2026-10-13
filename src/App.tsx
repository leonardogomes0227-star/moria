import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useLenis } from '@/hooks/useLenis'
import Home from '@/pages/Home'

const Admin = lazy(() => import('@/pages/Admin'))

export default function App() {
  useLenis()
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}
