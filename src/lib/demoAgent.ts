import type { Category, MenuItem, NewOrder, OrderLine, PaymentMethod, StoreSettings } from './types.ts'

/**
 * Atendente de demonstração (sem IA): usa o cardápio real, conduz o pedido do começo ao fim e devolve o pedido pronto.
 * Serve só para mostrar o fluxo quando a IA não está ligada. A IA de verdade entende muito mais.
 */

export interface DemoTurn {
  parts: string[]
  /** Pedido confirmado pelo cliente nesta rodada. */
  order?: NewOrder
  handoff?: boolean
}

type Stage = 'livre' | 'tipo' | 'nome' | 'endereco' | 'pagamento' | 'confirmar' | 'feito'

const brl = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const flat = (s: string) => norm(s).replace(/[-_]/g, ' ')
const has = (t: string, re: RegExp) => re.test(t)

const NUMBERS: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5 }
const STOP = new Set(['de', 'da', 'do', 'com', 'e', 'moria', 'burguer', 'burger', 'cola', 'lata', '1l', '2l', '350ml'])

/** Apelidos que o cliente usa no dia a dia → palavra-chave do item. */
const ALIASES: [RegExp, string][] = [
  [/\b(xb|x-?burguer|x-?burger|xis)\b/, 'x burguer'],
  [/\b(coca|cocacola|coca-?cola)\b.*\b(2 ?l|2 litros|dois litros|2lt)\b/, 'coca-cola 2l'],
  [/\b(coca|cocacola|coca-?cola)\b/, 'coca-cola 350ml'],
]

const CATEGORY_WORDS: [RegExp, Category][] = [
  [/hamburguer|burger|burguer|gourmet|brasa|artesanal/, 'Hambúrgueres'],
  [/tradicion|prensado|lanche|x-|xis/, 'Tradicionais'],
  [/baguete/, 'Baguetes'],
  [/batata|acompanh|porcao|cebola/, 'Acompanhamentos'],
  [/molho/, 'Molhos'],
  [/bebida|refri|suco|beber/, 'Bebidas'],
  [/combo/, 'Combos'],
]

interface Line {
  item: MenuItem
  qtd: number
}

export function createDemoAgent(menu: MenuItem[], settings: StoreSettings, openLabel = '') {
  const available = menu.filter((m) => m.disponivel)
  let stage: Stage = 'livre'
  let cart: Line[] = []
  let tipo: 'entrega' | 'retirada' = 'entrega'
  let nome = ''
  let endereco = ''
  let pagamento: PaymentMethod = 'Pix'
  let troco = ''
  let upsold = false
  let awaitingTroco = false

  const fee = settings.deliveryFee.mode === 'fixed' ? settings.deliveryFee.amount : null
  const subtotal = () => cart.reduce((n, l) => n + l.item.preco * l.qtd, 0)
  const entrega = () => (tipo === 'retirada' ? 0 : fee)
  const total = () => subtotal() + (entrega() ?? 0)
  const first = () => (nome ? nome.split(' ')[0] : '')

  const summary = () =>
    cart.map((l) => `- ${l.qtd}x ${l.item.nome} — ${brl(l.item.preco * l.qtd)}`).join('\n')

  const qtyIn = (seg: string): number => {
    const m = seg.match(/\b(\d{1,2})\s*x?\b(?!\s*(l\b|lt\b|litros?|ml))/)
    if (m) return Math.min(10, Math.max(1, Number(m[1])))
    for (const [w, n] of Object.entries(NUMBERS)) if (new RegExp(`\\b${w}\\b`).test(seg)) return n
    return 1
  }

  /** Procura itens do cardápio numa frase. Devolve o que achou e o que ficou ambíguo. */
  const findItems = (text: string) => {
    const found: Line[] = []
    const ambiguous: MenuItem[][] = []
    for (const raw of text.split(/,| e | com |\+| mais | e tambem /)) {
      let seg = norm(raw)
      if (!seg.trim()) continue
      for (const [re, key] of ALIASES) {
        if (re.test(seg)) {
          seg += ` ${key}`
          break
        }
      }
      const scored = available
        .map((item) => {
          const tokens = norm(item.nome)
            .split(/[^a-z0-9]+/)
            .filter((t) => t.length > 2 && !STOP.has(t))
          // Nome completo dito pelo cliente (ou pelo apelido) vale mais que palavras soltas.
          const hits = tokens.filter((t) => seg.includes(t)).length + (flat(seg).includes(flat(item.nome)) ? 10 : 0)
          return { item, hits, ratio: tokens.length ? hits / tokens.length : 0 }
        })
        .filter((s) => s.hits > 0)
        .sort((a, b) => b.hits - a.hits || b.ratio - a.ratio)
      if (!scored.length) continue
      const best = scored[0]
      const tied = scored.filter((s) => s.hits === best.hits && s.ratio === best.ratio)
      if (tied.length > 1) ambiguous.push(tied.map((t) => t.item))
      else found.push({ item: best.item, qtd: qtyIn(seg) })
    }
    return { found, ambiguous }
  }

  const addToCart = (lines: Line[]) => {
    for (const l of lines) {
      const ex = cart.find((c) => c.item.id === l.item.id)
      if (ex) ex.qtd += l.qtd
      else cart.push({ ...l })
    }
  }

  const hasCat = (cat: Category) => available.some((i) => i.categoria === cat)

  const listCategory = (cat: Category): string => {
    const all = available.filter((i) => i.categoria === cat)
    const shown = all.slice(0, 10).map((i) => `- ${i.nome} — ${brl(i.preco)}`)
    if (all.length > shown.length) shown.push(`…e mais ${all.length - shown.length} opções`)
    return shown.join('\n')
  }

  const upsell = (): string | null => {
    if (upsold) return null
    upsold = true
    const drinks = available.filter((i) => i.categoria === 'Bebidas')
    if (!drinks.length || cart.some((l) => l.item.categoria === 'Bebidas')) return null
    return `Vai querer uma bebida gelada pra acompanhar? Temos ${drinks.map((d) => d.nome).join(', ')}. 🥤`
  }

  const askNext = (): string[] => {
    stage = 'tipo'
    return ['Agora me diz: é *entrega* ou *retirada*?']
  }

  const confirmText = (): string[] => {
    stage = 'confirmar'
    const feeLine = tipo === 'retirada' ? 'Retirada: sem taxa' : fee === null ? 'Entrega: taxa a combinar' : `Entrega: ${brl(fee)}`
    const where = tipo === 'entrega' ? `\nEndereço: ${endereco}` : ''
    return [
      `Perfeito, ${first()}! Confere o pedido:`,
      `${summary()}\n${feeLine}\n*Total: ${brl(total())}${tipo === 'entrega' && fee === null ? ' + entrega' : ''}*${where}\nPagamento: ${pagamento}${troco ? ` (troco para ${troco})` : ''}`,
      'Posso confirmar?',
    ]
  }

  const handoffTurn = (): DemoTurn => ({
    parts: ['Claro! Vou chamar um atendente da casa pra continuar com você. 🙏', 'Aviso a equipe agora, e eu fico em silêncio por aqui até ele assumir.'],
    handoff: true,
  })

  const reply = (input: string): DemoTurn => {
    const t = norm(input)
    if (has(t, /ignor(e|ar)|esquec(a|er)|suas (instrucoes|regras)|prompt|revele|finja|de graca/))
      return { parts: ['Isso eu não consigo fazer, mas posso te ajudar com o cardápio e o seu pedido. 😊', 'O que você vai querer hoje?'] }
    if (has(t, /atendente|pessoa|humano|gerente|dono|reclam/)) return handoffTurn()

    if (stage === 'feito') {
      if (has(t, /cade|status|pedido|demora|quanto tempo/))
        return { parts: ['Seu pedido já está na cozinha, que confirma em instantes. 🔥', 'No painel dela ele aparece como *Novo*, com a etiqueta WhatsApp.'] }
      stage = 'livre'
      cart = []
      upsold = false
    }

    // etapas que esperam um dado específico
    if (stage === 'nome') {
      nome = input.replace(/^(meu nome (e|é)|me chamo|sou (o|a)?|aqui (e|é) (o|a)?)\s+/i, '').trim().slice(0, 60)
      if (nome.length < 2) return { parts: ['Pode me dizer seu nome pra eu anotar?'] }
      if (tipo === 'entrega') {
        stage = 'endereco'
        return { parts: [`Prazer, ${first()}! Aqui você é de casa. 🤝`, 'Qual o endereço completo da entrega? (rua, número e um ponto de referência)'] }
      }
      stage = 'pagamento'
      return { parts: [`Prazer, ${first()}! 🤝`, `Como vai pagar? Aceitamos ${settings.payments.join(', ')}.`] }
    }
    if (stage === 'endereco') {
      if (input.trim().length < 6) return { parts: ['Preciso do endereço completo: rua, número e referência. Pode mandar?'] }
      endereco = input.trim().slice(0, 200)
      stage = 'pagamento'
      return { parts: ['Anotado! 📍', `Como vai pagar? Aceitamos ${settings.payments.join(', ')}.`] }
    }
    if (stage === 'pagamento') {
      if (awaitingTroco) {
        const m = input.match(/(\d+[.,]?\d*)/)
        if (!m && !has(t, /nao|sem troco|trocado|certinho/)) return { parts: ['Pra quanto você vai precisar de troco? (ou diga “sem troco”)'] }
        troco = m ? `R$ ${m[1]}` : ''
        awaitingTroco = false
        return { parts: confirmText() }
      }
      const pay = has(t, /pix/) ? 'Pix' : has(t, /cart|credito|debito/) ? 'Cartão' : has(t, /dinheiro|especie/) ? 'Dinheiro' : null
      if (!pay) return { parts: [`Qual a forma de pagamento? ${settings.payments.join(', ')}.`] }
      if (!settings.payments.includes(pay)) return { parts: [`Aqui não aceitamos ${pay}. Aceitamos ${settings.payments.join(', ')}.`] }
      pagamento = pay
      if (pay === 'Dinheiro') {
        const m = input.match(/(\d+[.,]?\d*)/)
        troco = m ? `R$ ${m[1]}` : ''
        if (!m) {
          awaitingTroco = true
          return { parts: ['Vai precisar de troco? Pra quanto?'] }
        }
      }
      return { parts: confirmText() }
    }
    if (stage === 'confirmar') {
      if (has(t, /\b(sim|pode|confirmo|confirma|isso|fechou|fechado|bora|ok|certo)\b/) && !has(t, /\bnao\b/)) {
        stage = 'feito'
        const lines: OrderLine[] = cart.map((l) => ({ item_id: l.item.id, nome: l.item.nome, qtd: l.qtd, preco: l.item.preco, adicionais: [], obs: '' }))
        const order: NewOrder = {
          origem: 'whatsapp',
          tipo,
          cliente_nome: nome,
          cliente_telefone: '5567900000000',
          endereco: tipo === 'entrega' ? endereco : '',
          pagamento,
          troco,
          obs: 'Pedido feito na demonstração do assistente.',
          itens: lines,
          subtotal: subtotal(),
          entrega: entrega(),
          total: total(),
        }
        return { parts: [`Fechado, ${first()}! Pedido registrado. ✅`, 'A cozinha já recebeu e confirma em instantes. Agora é só esperar a brasa trabalhar! 🍔🔥'], order }
      }
      if (has(t, /\bnao\b|muda|troca|tira|remove|alterar/)) {
        stage = 'livre'
        return { parts: ['Sem problema! O que você quer mudar no pedido?'] }
      }
    }
    if (stage === 'tipo') {
      const isDelivery = has(t, /entrega|entregar|delivery|casa|leva/)
      const isPickup = has(t, /retir|buscar|busco|vou ai|pego/)
      if (isDelivery || isPickup) {
        tipo = isPickup && !isDelivery ? 'retirada' : 'entrega'
        stage = 'nome'
        return { parts: [tipo === 'entrega' ? 'Fechou, vamos levar até você! 🛵' : 'Fechou, é só passar aqui pra pegar quentinho! 🙌', 'Qual o seu nome?'] }
      }
    }

    // edição do carrinho
    if (cart.length && has(t, /\b(tira|tirar|remove|remover|sem a|cancela o item)\b/)) {
      const { found } = findItems(input.replace(/.*(tira|tirar|remove|remover)\s+(a|o|as|os)?\s*/i, ''))
      if (found.length) {
        cart = cart.filter((l) => !found.some((f) => f.item.id === l.item.id))
        if (!cart.length) {
          stage = 'livre'
          return { parts: ['Tirei! Seu carrinho ficou vazio. O que você vai querer?'] }
        }
        return { parts: [`Tirei! Ficou assim:\n${summary()}\n*Subtotal: ${brl(subtotal())}*`, stage === 'livre' ? 'Mais alguma coisa, ou já fecho o pedido?' : 'Seguimos?'] }
      }
    }
    const swap = t.match(/troca(?:r)? (?:a |o )?(.+?) por (?:um |uma )?(.+)/)
    if (cart.length && swap) {
      const out = findItems(swap[1]).found[0]
      const into = findItems(swap[2]).found[0]
      if (out && into) {
        const qtd = cart.find((l) => l.item.id === out.item.id)?.qtd ?? 1
        cart = cart.filter((l) => l.item.id !== out.item.id)
        addToCart([{ item: into.item, qtd }])
        return { parts: [`Troquei! Agora ficou:\n${summary()}\n*Subtotal: ${brl(subtotal())}*`, 'Posso seguir pro endereço?'] }
      }
    }

    // intenções livres
    if (has(t, /horario|aberto|abre|fecha|funciona/))
      return { parts: [openLabel ? `${openLabel}. 🕒` : 'Funcionamos à noite, todos os dias. 🕒', 'Quer ver o cardápio ou já fazer o pedido?'] }
    if (has(t, /desconto|promocao|cupom|mais barato|fiado/))
      return { parts: ['Os preços do cardápio são fixos e eu não consigo dar desconto, mas garanto que o sabor compensa. 🙏', 'Se quiser conversar sobre isso, posso chamar um atendente. Quer?'] }
    if (has(t, /pizza|sushi|lasanha|acai|sorvete|pastel|marmita|batata|fritas|porcao|sobremesa|molho extra/))
      return { parts: ['Isso eu não tenho no cardápio, aqui o forte é a brasa! 😅', 'Posso te mostrar os hambúrgueres da casa e os lanches tradicionais, ou chamar um atendente se quiser confirmar outra coisa.'] }
    if (has(t, /pix|pagamento|cartao|aceita|forma de pag/) && !cart.length)
      return { parts: [`Aceitamos ${settings.payments.join(', ')}.`, 'O pagamento é combinado quando você confirma o pedido.'] }
    if (has(t, /entrega|taxa|frete/) && !cart.length)
      return { parts: [fee === null ? 'A taxa de entrega depende do endereço e eu confirmo com a equipe.' : `A taxa de entrega é ${brl(fee)}. Retirada no local é sem taxa.`] }

    const { found, ambiguous } = findItems(input)
    if (found.length || ambiguous.length) {
      addToCart(found)
      const parts: string[] = []
      if (found.length) parts.push(`Show, tá na brasa! 😋\n${summary()}\n*Subtotal: ${brl(subtotal())}*`)
      for (const group of ambiguous.slice(0, 1))
        parts.push(`Qual você quer?\n${group.map((g) => `- ${g.nome} — ${brl(g.preco)}`).join('\n')}`)
      if (found.length && !ambiguous.length) {
        const up = upsell()
        if (up) parts.push(up)
        else if (settings.minOrder > subtotal()) parts.push(`O pedido mínimo é ${brl(settings.minOrder)}. Quer adicionar mais algo?`)
        else parts.push(...askNext())
        if (up) stage = 'livre'
      }
      return { parts }
    }

    if (has(t, /cardapio|menu|opcoes|o que tem|que voces tem|indica|sugest/)) {
      for (const [re, cat] of CATEGORY_WORDS) if (has(t, re) && hasCat(cat)) return { parts: [`Olha as opções de ${cat.toLowerCase()}:\n${listCategory(cat)}`, 'Qual chamou a atenção?'] }
      const star = available.find((i) => i.destaque) ?? available[0]
      return { parts: ['Temos os hambúrgueres da casa (assados na brasa), os lanches tradicionais (os X-) e bebidas. 🍔', `O destaque da casa é o *${star.nome}* (${brl(star.preco)}). Quer começar por ele ou ver outra categoria?`] }
    }
    for (const [re, cat] of CATEGORY_WORDS) if (has(t, re) && hasCat(cat)) return { parts: [`Olha as opções de ${cat.toLowerCase()}:\n${listCategory(cat)}`, 'Qual você quer?'] }

    if (cart.length && has(t, /so isso|so|nada|fecha|pode fechar|mais nada|e isso|nao quero mais|finalizar/)) return { parts: askNext() }
    if (cart.length && stage === 'livre' && has(t, /\b(sim|quero|pode|bora)\b/)) return { parts: askNext() }
    if (has(t, /cade|status|meu pedido/)) return { parts: ['Você ainda não tem pedido por aqui. Quer fazer um agora? 😊'] }
    if (has(t, /\b(oi|ola|bom dia|boa tarde|boa noite|e ai|eae|opa)\b/) || !cart.length)
      return { parts: ['Fala! Aqui é o Mori, da brasa da Moriá. 🔥🍔', 'Bora matar essa fome? Posso te mostrar o cardápio ou já anotar seu pedido. O que você tá com vontade?'] }
    return { parts: ['Eita, essa eu não peguei. 😅 Me diz o que você quer comer, ou pede o cardápio que eu mostro.'] }
  }

  return { reply }
}
