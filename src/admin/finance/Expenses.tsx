import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PlusIcon, TrashIcon } from '@/components/Icons'
import { config } from '@/lib/config'
import { repo } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { importFinanceExample } from '@/lib/finance/importExample'
import { EXPENSE_GROUPS, type Expense, type ExpenseGroup } from '@/lib/types'
import { toast } from '@/store/toast'
import { NumField } from '../fields'
import { Tip } from '../Tip'
import { Card, ErrorBox, HelpBox, PageHeader, Spinner } from '../ui'
import { FinanceTabs } from './FinanceTabs'
import { useFinanceData } from './useFinanceData'

type Draft = Omit<Expense, 'id'> & { id?: string }
const thisMonth = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone })
    .format(new Date())
    .slice(0, 7)

function ExpenseForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Draft
  onSave: (d: Draft) => Promise<void>
  onClose: () => void
}) {
  const [d, setD] = useState(initial)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!d.nome.trim()) return toast('Dê um nome à despesa.', 'error')
    setBusy(true)
    try {
      await onSave({
        ...d,
        nome: d.nome.trim(),
        mes: d.recorrencia === 'unica' ? d.mes || thisMonth() : '',
      })
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label htmlFor="ex-nome" className="label">
          Nome
        </label>
        <input
          id="ex-nome"
          className="input"
          value={d.nome}
          onChange={(e) => setD({ ...d, nome: e.target.value })}
          placeholder="Ex.: Aluguel do ponto"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ex-grupo" className="label">
            Tipo de gasto
          </label>
          <select
            id="ex-grupo"
            className="input"
            value={d.grupo}
            onChange={(e) => setD({ ...d, grupo: e.target.value as ExpenseGroup })}
          >
            {EXPENSE_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <NumField
          id="ex-valor"
          label="Valor"
          prefix="R$"
          value={d.valor}
          onChange={(v) => setD({ ...d, valor: v })}
        />
      </div>
      <fieldset>
        <legend className="label">Com que frequência?</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="rec"
              className="accent-[#D61F1F]"
              checked={d.recorrencia === 'mensal'}
              onChange={() => setD({ ...d, recorrencia: 'mensal' })}
            />{' '}
            Todo mês
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="rec"
              className="accent-[#D61F1F]"
              checked={d.recorrencia === 'unica'}
              onChange={() =>
                setD({ ...d, recorrencia: 'unica', mes: d.mes || thisMonth() })
              }
            />{' '}
            Só uma vez
          </label>
        </div>
      </fieldset>
      {d.recorrencia === 'unica' && (
        <div>
          <label htmlFor="ex-mes" className="label">
            Em qual mês?
          </label>
          <input
            id="ex-mes"
            type="month"
            className="input w-48"
            value={d.mes}
            onChange={(e) => setD({ ...d, mes: e.target.value })}
          />
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

export default function Expenses() {
  const fin = useFinanceData()
  const [editing, setEditing] = useState<Expense | 'new' | null>(null)

  const monthly = useMemo(
    () => fin.expenses.filter((e) => e.recorrencia === 'mensal'),
    [fin.expenses],
  )
  const once = useMemo(
    () =>
      fin.expenses
        .filter((e) => e.recorrencia === 'unica')
        .sort((a, b) => b.mes.localeCompare(a.mes)),
    [fin.expenses],
  )
  const total = monthly.reduce((n, e) => n + e.valor, 0)

  const run = async (action: () => Promise<void>, ok: string) => {
    try {
      await action()
      await fin.reload()
      toast(ok)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Operação falhou.', 'error')
    }
  }

  const row = (e: Expense) => (
    <li key={e.id} className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{e.nome}</p>
        <p className="text-sm text-muted">
          {e.grupo}
          {e.recorrencia === 'unica' ? ` · só em ${e.mes}` : ' · todo mês'}
        </p>
      </div>
      <span className="text-lg font-bold">{formatPrice(e.valor)}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          className="!px-4 !py-2 text-sm"
          onClick={() => setEditing(e)}
        >
          Editar
        </Button>
        <button
          type="button"
          aria-label={`Excluir ${e.nome}`}
          onClick={() =>
            window.confirm(`Excluir “${e.nome}”?`) &&
            void run(() => repo.finance.expenses.remove(e.id), 'Despesa excluída.')
          }
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-white/10 hover:text-brand-light"
        >
          <TrashIcon size={18} /> <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>
    </li>
  )

  return (
    <>
      <PageHeader
        title="Despesas"
        description="Contas que existem mesmo sem vender: aluguel, luz, gás, internet, contador, marketing…"
        actions={
          <Tip
            text="Cadastra uma conta nova, que pode se repetir todo mês ou valer só uma vez."
            side="bottom"
          >
            <Button onClick={() => setEditing('new')}>
              <PlusIcon size={18} /> Nova despesa
            </Button>
          </Tip>
        }
      />
      <FinanceTabs />
      <HelpBox title="Passo 3: as contas fixas do mês">
        <p>
          Aqui entram os gastos que não dependem de quantos hambúrgueres você vende.{' '}
          <strong>Não coloque</strong> ingredientes e embalagens (já estão nas fichas
          técnicas) nem salários (são cadastrados em “Equipe e motoboy”).
        </p>
        <p>
          Use <strong>“Todo mês”</strong> para contas recorrentes e{' '}
          <strong>“Só uma vez”</strong> para gastos pontuais (ex.: conserto de uma chapa).
        </p>
      </HelpBox>
      {fin.error && <ErrorBox message={fin.error} onRetry={() => void fin.reload()} />}
      {!fin.loaded && !fin.error && <Spinner />}

      {fin.loaded && fin.expenses.length === 0 && (
        <div className="card mb-6 space-y-3 p-6 text-center">
          <p className="text-muted">Nenhuma despesa cadastrada ainda.</p>
          <Button
            variant="ghost"
            onClick={() =>
              void run(
                importFinanceExample,
                'Dados de exemplo importados (valores fictícios).',
              )
            }
          >
            Importar exemplo de hamburgueria
          </Button>
        </div>
      )}

      {monthly.length > 0 && (
        <Card
          title="Despesas mensais"
          description={`Total por mês: ${formatPrice(total)}`}
        >
          <ul className="space-y-2">{monthly.map(row)}</ul>
        </Card>
      )}
      {once.length > 0 && (
        <div className="mt-5">
          <Card title="Gastos pontuais">
            <ul className="space-y-2">{once.map(row)}</ul>
          </Card>
        </div>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nova despesa' : 'Editar despesa'}
        variant="center"
      >
        {editing && (
          <ExpenseForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={
              editing === 'new'
                ? { nome: '', grupo: 'Outros', valor: 0, recorrencia: 'mensal', mes: '' }
                : editing
            }
            onClose={() => setEditing(null)}
            onSave={async (d) => {
              await repo.finance.expenses.save(d)
              setEditing(null)
              await fin.reload()
              toast('Despesa salva.')
            }}
          />
        )}
      </Dialog>
    </>
  )
}
