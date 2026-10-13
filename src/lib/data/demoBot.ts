import type { BotConversation, BotMessage } from '../types.ts'

const MIN = 60_000

/** Conversas fictícias (só do modo demonstração) para a tela do assistente não nascer vazia. */
export function buildDemoConversations(now = Date.now()): BotConversation[] {
  const msg = (
    id: string,
    telefone: string,
    papel: BotMessage['papel'],
    texto: string,
    ago: number,
    tin = 0,
    tout = 0,
  ): BotMessage => ({
    id,
    telefone,
    papel,
    texto,
    criado_em: new Date(now - ago * MIN).toISOString(),
    tokens_in: tin,
    tokens_out: tout,
    tokens_cache: tin ? 3800 : 0,
  })
  return [
    {
      telefone: '5567991110001',
      nome: 'Cliente Exemplo 1',
      ultima_em: new Date(now - 14 * MIN).toISOString(),
      humano_ate: null,
      mensagens: [
        msg('d1', '5567991110001', 'cliente', 'Oi! Vocês têm hambúrguer sem cebola?', 20),
        msg(
          'd2',
          '5567991110001',
          'assistente',
          'Oi! 😊 Aqui é o Mori, da Moriá Hamburgueria. Tenho sim! Todos os hambúrgueres podem sair sem cebola. Quer ver as opções?',
          19,
          1100,
          160,
        ),
        msg('d3', '5567991110001', 'cliente', 'Quero um Vulcão Bacon e uma batata', 17),
        msg(
          'd4',
          '5567991110001',
          'assistente',
          'Anotado: 1x Vulcão Bacon (sem cebola) e 1x Batata Frita Crocante = R$ 50,00. É para entrega ou retirada?',
          16,
          1250,
          190,
        ),
        msg(
          'd5',
          '5567991110001',
          'cliente',
          'Entrega. Rua das Flores 10, Centro. Pix',
          15,
        ),
        msg(
          'd6',
          '5567991110001',
          'assistente',
          'Perfeito! Pedido #14 confirmado: total R$ 55,00 com a entrega. Já mandei para a cozinha! 🍔',
          14,
          1500,
          210,
        ),
      ],
    },
    {
      telefone: '5567991110002',
      nome: 'Cliente Exemplo 2',
      ultima_em: new Date(now - 130 * MIN).toISOString(),
      humano_ate: new Date(now + 90 * MIN).toISOString(),
      mensagens: [
        msg(
          'd7',
          '5567991110002',
          'cliente',
          'Vocês fazem festa de aniversário com 30 hambúrgueres?',
          135,
        ),
        msg(
          'd8',
          '5567991110002',
          'assistente',
          'Que legal! Para encomendas grandes eu chamo o responsável para combinar os detalhes com você. Um instante! 🙏',
          134,
          1200,
          140,
        ),
        msg(
          'd9',
          '5567991110002',
          'atendente',
          'Boa tarde! Aqui é o dono, vamos combinar sim.',
          130,
        ),
      ],
    },
  ]
}
