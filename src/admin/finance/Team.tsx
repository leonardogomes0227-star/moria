import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PlusIcon, TrashIcon } from '@/components/Icons'
import { repo } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { importFinanceExample } from '@/lib/finance/importExample'
import { employeeMonthlyCost } from '@/lib/finance/calc'
import type { CourierMode, Employee, FinanceSettings, PayMode } from '@/lib/types'
import { toast } from '@/store/toast'
import { NumField } from '../fields'
import { Tip } from '../Tip'
import { Card, ErrorBox, HelpBox, PageHeader, Spinner, Toggle } from '../ui'
import { FinanceTabs } from './FinanceTabs'
import { useFinanceData } from './useFinanceData'

type Draft = Omit<Employee, 'id'> & { id?: string }
const blank: Draft = {
  nome: '',
  funcao: '',
  pagamento: 'mensal',
  valor: 0,
  dias_mes: 22,
  horas_mes: 0,
  encargos_pct: 0,
  ativo: true,
}
const PAY_LABEL: Record<PayMode, string> = {
  mensal: 'Salário mensal',
  diaria: 'Diária',
  hora: 'Por hora',
}

function EmployeeForm({
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
  const monthly = employeeMonthlyCost({ ...d, id: 'x' })
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!d.nome.trim()) return toast('Informe o nome ou a função.', 'error')
    setBusy(true)
    try {
      await onSave({ ...d, nome: d.nome.trim() })
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="em-nome" className="label">
            Nome
          </label>
          <input
            id="em-nome"
            className="input"
            value={d.nome}
            onChange={(e) => setD({ ...d, nome: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="em-func" className="label">
            Função
          </label>
          <input
            id="em-func"
            className="input"
            value={d.funcao}
            onChange={(e) => setD({ ...d, funcao: e.target.value })}
            placeholder="Chapeiro, caixa…"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="em-pag" className="label">
            Como é pago
          </label>
          <select
            id="em-pag"
            className="input"
            value={d.pagamento}
            onChange={(e) => setD({ ...d, pagamento: e.target.value as PayMode })}
          >
            {(Object.keys(PAY_LABEL) as PayMode[]).map((p) => (
              <option key={p} value={p}>
                {PAY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <NumField
          id="em-valor"
          label={
            d.pagamento === 'mensal'
              ? 'Salário'
              : d.pagamento === 'diaria'
                ? 'Valor da diária'
                : 'Valor da hora'
          }
          prefix="R$"
          value={d.valor}
          onChange={(v) => setD({ ...d, valor: v })}
        />
      </div>
      {d.pagamento === 'diaria' && (
        <NumField
          id="em-dias"
          label="Dias trabalhados por mês"
          value={d.dias_mes}
          onChange={(v) => setD({ ...d, dias_mes: v })}
          hint="Ex.: 22 dias úteis, ou 26 se trabalha sábado."
        />
      )}
      {d.pagamento === 'hora' && (
        <NumField
          id="em-horas"
          label="Horas trabalhadas por mês"
          value={d.horas_mes}
          onChange={(v) => setD({ ...d, horas_mes: v })}
        />
      )}
      <NumField
        id="em-enc"
        label="Encargos sobre o pagamento"
        suffix="%"
        value={d.encargos_pct}
        onChange={(v) => setD({ ...d, encargos_pct: v })}
        hint="FGTS, férias, 13º, INSS… Se não é registrado, deixe 0. Pergunte ao seu contador o percentual certo."
      />
      <p className="rounded-xl border border-line bg-bg p-3 text-sm">
        Custo mensal desta pessoa:{' '}
        <strong className="text-ember">{formatPrice(monthly)}</strong>
      </p>
      <label className="flex items-center gap-3 text-sm font-medium">
        <Toggle
          label="Funcionário ativo"
          checked={d.ativo}
          onChange={(v) => setD({ ...d, ativo: v })}
        />
        Trabalhando atualmente (desligue para tirar da conta sem apagar)
      </label>
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

function RatesCard({
  settings,
  onSaved,
}: {
  settings: FinanceSettings
  onSaved: () => Promise<void>
}) {
  const [s, setS] = useState(settings)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      await repo.finance.settings.save(s)
      await onSaved()
      toast('Motoboy e taxas salvos.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha ao salvar.', 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-5">
      <Card
        title="Motoboy"
        description="Quanto custa levar os pedidos. Este valor entra na conta do lucro."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="co-modo" className="label">
              Como você paga
            </label>
            <select
              id="co-modo"
              className="input"
              value={s.courier_modo}
              onChange={(e) =>
                setS({ ...s, courier_modo: e.target.value as CourierMode })
              }
            >
              <option value="por_entrega">Por entrega feita</option>
              <option value="diaria">Diária</option>
              <option value="mensal">Salário mensal</option>
            </select>
          </div>
          <NumField
            id="co-valor"
            label={
              s.courier_modo === 'por_entrega'
                ? 'Valor por entrega'
                : s.courier_modo === 'diaria'
                  ? 'Valor da diária'
                  : 'Salário'
            }
            prefix="R$"
            value={s.courier_valor}
            onChange={(v) => setS({ ...s, courier_valor: v })}
          />
          {s.courier_modo === 'diaria' && (
            <NumField
              id="co-dias"
              label="Dias por mês"
              value={s.courier_dias}
              onChange={(v) => setS({ ...s, courier_dias: v })}
            />
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          {s.courier_modo === 'por_entrega'
            ? 'O sistema conta quantas entregas aconteceram no mês e multiplica pelo valor. A taxa de entrega que o cliente paga entra como receita.'
            : 'Valor fixo: é dividido pelos dias do mês que já passaram, como a equipe.'}
        </p>
      </Card>
      <Card
        title="Taxas, impostos e meta de lucro"
        description="Usados para calcular a margem real de cada produto e o preço sugerido."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <NumField
            id="tx-cartao"
            label="Taxa da maquininha (cartão)"
            suffix="%"
            value={s.taxa_cartao_pct}
            onChange={(v) => setS({ ...s, taxa_cartao_pct: v })}
            hint="Percentual cobrado sobre vendas no cartão."
          />
          <NumField
            id="tx-imp"
            label="Impostos sobre vendas"
            suffix="%"
            value={s.imposto_pct}
            onChange={(v) => setS({ ...s, imposto_pct: v })}
            hint="Ex.: Simples Nacional. Confirme com o contador."
          />
          <NumField
            id="tx-meta"
            label="Lucro que você quer"
            suffix="%"
            value={s.meta_lucro_pct}
            onChange={(v) => setS({ ...s, meta_lucro_pct: v })}
            hint="Sobre o preço de venda. Define o preço sugerido."
          />
        </div>
      </Card>
      <div className="flex justify-end">
        <Tip
          text="Grava o motoboy, as taxas e a meta de lucro. Os cálculos de custo e lucro passam a usar esses valores."
          side="top"
        >
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar motoboy e taxas'}
          </Button>
        </Tip>
      </div>
    </div>
  )
}

export default function Team() {
  const fin = useFinanceData()
  const [editing, setEditing] = useState<Employee | 'new' | null>(null)
  const total = useMemo(
    () =>
      fin.staff.filter((e) => e.ativo).reduce((n, e) => n + employeeMonthlyCost(e), 0),
    [fin.staff],
  )

  const run = async (action: () => Promise<void>, ok: string) => {
    try {
      await action()
      await fin.reload()
      toast(ok)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Operação falhou.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Equipe e motoboy"
        description="Quanto custa a mão de obra da hamburgueria, com o entregador, as taxas e a meta de lucro."
        actions={
          <Tip
            text="Cadastra um funcionário e calcula quanto ele custa por mês, com encargos."
            side="bottom"
          >
            <Button onClick={() => setEditing('new')}>
              <PlusIcon size={18} /> Novo funcionário
            </Button>
          </Tip>
        }
      />
      <FinanceTabs />
      <HelpBox title="Passo 4: mão de obra">
        <p>
          Cadastre quem trabalha na loja e como é pago (mensal, diária ou por hora). Os{' '}
          <strong>encargos</strong> são o que a empresa paga a mais além do salário. O
          motoboy tem uma área própria, porque normalmente é pago por entrega.
        </p>
        <p>
          Sua própria retirada (pró-labore) pode entrar como um funcionário, se quiser ver
          o lucro já descontando o seu salário.
        </p>
      </HelpBox>
      {fin.error && <ErrorBox message={fin.error} onRetry={() => void fin.reload()} />}
      {!fin.loaded && !fin.error && <Spinner />}

      {fin.loaded && fin.staff.length === 0 && (
        <div className="card mb-6 space-y-3 p-6 text-center">
          <p className="text-muted">Nenhum funcionário cadastrado ainda.</p>
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

      {fin.staff.length > 0 && (
        <div className="mb-6">
          <Card
            title="Equipe"
            description={`Custo mensal total (ativos): ${formatPrice(total)}`}
          >
            <ul className="space-y-2">
              {fin.staff.map((e) => (
                <li
                  key={e.id}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-bg p-4 ${e.ativo ? '' : 'opacity-50'}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {e.nome}
                      {!e.ativo && ' (inativo)'}
                    </p>
                    <p className="text-sm text-muted">
                      {e.funcao || 'Sem função'} · {PAY_LABEL[e.pagamento]}{' '}
                      {formatPrice(e.valor)}
                      {e.pagamento === 'diaria' && ` × ${e.dias_mes} dias`}
                      {e.pagamento === 'hora' && ` × ${e.horas_mes} h`}
                      {e.encargos_pct > 0 && ` + ${e.encargos_pct}% de encargos`}
                    </p>
                  </div>
                  <span className="text-lg font-bold">
                    {formatPrice(employeeMonthlyCost(e))}
                    <span className="text-xs font-normal text-muted"> /mês</span>
                  </span>
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
                        void run(
                          () => repo.finance.staff.remove(e.id),
                          'Funcionário excluído.',
                        )
                      }
                      className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-white/10 hover:text-brand-light"
                    >
                      <TrashIcon size={18} />{' '}
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {fin.loaded && (
        <RatesCard
          key={JSON.stringify(fin.settings)}
          settings={fin.settings}
          onSaved={fin.reload}
        />
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Novo funcionário' : 'Editar funcionário'}
        variant="center"
      >
        {editing && (
          <EmployeeForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? blank : editing}
            onClose={() => setEditing(null)}
            onSave={async (d) => {
              await repo.finance.staff.save(d)
              setEditing(null)
              await fin.reload()
              toast('Funcionário salvo.')
            }}
          />
        )}
      </Dialog>
    </>
  )
}
