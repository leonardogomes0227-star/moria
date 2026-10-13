import { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/admin/AdminLayout'
import { useAdminSession } from '@/admin/auth'
import Content from '@/admin/Content'
import Dashboard from '@/admin/Dashboard'
import Help from '@/admin/Help'
import { Login } from '@/admin/Login'
import MenuManager from '@/admin/MenuManager'
import Orders from '@/admin/Orders'
import StoreSettings from '@/admin/StoreSettings'
import { Spinner } from '@/admin/ui'

export default function Admin() {
  const session = useAdminSession()

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    document.title = 'Painel | Moriá Hamburgueria'
    return () => meta.remove()
  }, [])

  if (session.status === 'loading') return <Spinner />
  if (session.status === 'out') return <Login />

  return (
    <Routes>
      <Route element={<AdminLayout email={session.email} />}>
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="cardapio" element={<MenuManager />} />
        <Route path="loja" element={<StoreSettings />} />
        <Route path="conteudo" element={<Content />} />
        <Route path="ajuda" element={<Help />} />
        <Route
          path="*"
          element={
            <p className="p-8">
              Página não encontrada.{' '}
              <Link to="/admin" className="text-ember underline">
                Voltar ao início
              </Link>
            </p>
          }
        />
      </Route>
    </Routes>
  )
}
