// Confere o site publicado de uma vez só. Uso: node scripts/check-deploy.mjs https://seu-site.vercel.app
const base = (process.argv[2] ?? '').replace(/\/$/, '')
if (!/^https?:\/\//.test(base)) {
  console.error('Uso: node scripts/check-deploy.mjs https://seu-site.vercel.app')
  process.exit(2)
}

let failed = 0
// `hint` só aparece quando algo não está certo; `note` aparece sempre.
const line = (ok, text, hint = '', note = '') => {
  if (ok === false) failed++
  const extra = ok === true ? note : hint
  console.log(`${ok === true ? '✅' : ok === false ? '❌' : '⚠️ '} ${text}${extra ? `\n     → ${extra}` : ''}`)
}
const get = async (path, init) => {
  try {
    const res = await fetch(base + path, { redirect: 'follow', signal: AbortSignal.timeout(30_000), ...init })
    return { status: res.status, type: res.headers.get('content-type') ?? '', text: await res.text() }
  } catch (err) {
    return { status: 0, type: '', text: String(err) }
  }
}

console.log(`Conferindo ${base}\n`)

for (const [path, nome] of [['/', 'Site'], ['/demo', 'Central de demonstração (/demo)'], ['/teste', 'Chat do robô (/teste)'], ['/robo', 'Atalho /robo'], ['/admin', 'Painel (/admin)']]) {
  const r = await get(path)
  line(r.status === 200 && r.type.includes('text/html') && r.text.includes('id="root"'), `${nome}: abre`, r.status === 200 ? 'Respondeu, mas não parece o site.' : `Respondeu ${r.status || 'sem resposta'}. Confira se o deploy terminou e se o vercel.json está na raiz.`)
}
for (const path of ['/menu/burger-1.webp', '/hero/burger.webp', '/menu/x-bacon.svg']) {
  const r = await get(path)
  line(r.status === 200, `Imagem ${path}`, r.status === 200 ? '' : `Respondeu ${r.status}.`)
}
const home = await get('/')
line(/Moriá/.test(home.text), 'Título e dados da Moriá no HTML')

// Funções do servidor (/api)
const hook = await get('/api/whatsapp')
if (hook.status === 403 && !hook.type.includes('text/html')) line(true, 'Função do WhatsApp (/api/whatsapp): no ar')
else line(null, `Função do WhatsApp (/api/whatsapp): respondeu ${hook.status}`, 'Se for 404, a pasta api não foi publicada. Só importa para o robô de verdade, não para a demonstração.')

const chat = await get('/api/demo-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'oi, qual o horário?' }) })
if (chat.status === 200) {
  let reply = ''
  try { reply = JSON.parse(chat.text).reply ?? '' } catch { /* ignora */ }
  line(true, 'Robô com IA de verdade: respondendo', '', `Resposta: “${reply.slice(0, 90).replace(/\s+/g, ' ')}”`)
} else if (chat.status === 404) {
  line(null, 'Robô com IA: desligado (a demonstração usa o roteiro, que funciona igual)', 'Para ligar: DEMO_PUBLIC=1 e uma chave (FREE_LLM_KEY para IA gratuita, ou ANTHROPIC_API_KEY) na Vercel, e Redeploy. Veja docs/IA-GRATIS.md.')
} else if (chat.status === 503) {
  line(null, 'Robô com IA: falta a chave (FREE_LLM_KEY ou ANTHROPIC_API_KEY); a demonstração usa o roteiro')
} else {
  line(null, `Robô com IA: respondeu ${chat.status} (a demonstração cai no roteiro sozinha)`, chat.text.slice(0, 120))
}

console.log(failed ? `\n${failed} problema(s) acima. Resolva os ❌ antes de mandar o link.` : '\nTudo certo para mandar o link ao dono.')
process.exit(failed ? 1 : 0)
