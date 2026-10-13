import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin/custos', label: 'Resumo do mês', end: true },
  { to: '/admin/custos/ingredientes', label: 'Ingredientes' },
  { to: '/admin/custos/fichas', label: 'Fichas técnicas' },
  { to: '/admin/custos/despesas', label: 'Despesas' },
  { to: '/admin/custos/equipe', label: 'Equipe e motoboy' },
]

/** Abas do financeiro, na ordem em que a pessoa deve preencher. */
export function FinanceTabs() {
  return (
    <nav
      aria-label="Custos e lucro"
      className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1"
    >
      {TABS.map((t, i) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `shrink-0 rounded-pill px-4 py-2 text-sm font-semibold ${isActive ? 'bg-brand text-white shadow-glow' : 'bg-white/5 text-white/80 hover:bg-white/10'}`
          }
        >
          <span className="mr-1.5 opacity-60">{i + 1}.</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
