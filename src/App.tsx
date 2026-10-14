import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useLenis } from '@/hooks/useLenis'
import { useRemoteSettings } from '@/hooks/useRemoteSettings'
import Home from '@/pages/Home'

const Admin = lazy(() => import('@/pages/Admin'))
const Test = lazy(() => import('@/pages/Test'))
const Demo = lazy(() => import('@/pages/Demo'))

export default function App() {
  useLenis()
  useRemoteSettings()
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/teste" element={<Test />} />
        <Route path="/robo" element={<Test />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}
