import type { ComponentType, SVGProps } from 'react'
import {
  BotIcon,
  BurgerIcon,
  CoinIcon,
  HelpIcon,
  HomeIcon,
  ImageIcon,
  ReceiptIcon,
  SettingsIcon,
} from '@/components/Icons'

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

export interface AdminSection {
  to: string
  label: string
  /** Nome longo (menu lateral e guia). */
  title: string
  /** Frase curta que aparece no menu lateral. */
  short: string
  /** O que a pessoa consegue fazer nessa tela (guia de botões). */
  does: string[]
  icon: Icon
  end?: boolean
  /** Aparece direto na barra do celular; as demais ficam no botão “Mais”. */
  primary?: boolean
}

export const SECTIONS: AdminSection[] = [
  {
    to: '/admin',
    label: 'Início',
    title: 'Início',
    short: 'Resumo do dia',
    icon: HomeIcon,
    end: true,
    primary: true,
    does: [
      'Veja quantos pedidos e quanto faturou hoje.',
      'Descubra os itens que mais vendem.',
      'Use a chave “Receber pedidos pelo site” para pausar tudo rapidamente.',
    ],
  },
  {
    to: '/admin/pedidos',
    label: 'Pedidos',
    title: 'Pedidos',
    short: 'Acompanhe cada pedido',
    icon: ReceiptIcon,
    primary: true,
    does: [
      'Todo pedido feito no site aparece aqui como “Novo” (e toca um bipe).',
      'Aperte o botão grande vermelho para avançar: preparo → entrega → concluído.',
      '“Imprimir comanda” gera o papel da cozinha; “Chamar cliente” abre o WhatsApp dele.',
    ],
  },
  {
    to: '/admin/cardapio',
    label: 'Cardápio',
    title: 'Cardápio',
    short: 'Produtos, preços e fotos',
    icon: BurgerIcon,
    primary: true,
    does: [
      '“Novo item” cadastra um produto (nome, descrição, preço, foto e adicionais).',
      '“Disponível” liga/desliga o item quando acaba o estoque.',
      '“Mais pedido” coloca o selo de destaque e leva o item para a vitrine do site.',
    ],
  },
  {
    to: '/admin/custos',
    label: 'Custos',
    title: 'Custos e lucro',
    short: 'Quanto custa e quanto sobra',
    icon: CoinIcon,
    primary: true,
    does: [
      'Veja o lucro do mês: faturamento menos ingredientes, equipe, motoboy, despesas e impostos.',
      'Cadastre ingredientes (quanto pagou) e monte a ficha técnica de cada produto para saber o custo e a margem.',
      'Cadastre despesas fixas, funcionários e o pagamento do motoboy. O sistema sugere o preço certo de venda.',
    ],
  },
  {
    to: '/admin/assistente',
    label: 'Assistente',
    title: 'Assistente de WhatsApp (IA)',
    short: 'Robô que atende e anota',
    icon: BotIcon,
    does: [
      'Liga ou desliga o assistente que responde seus clientes no WhatsApp e anota pedidos sozinho.',
      'Defina o nome, o jeito de falar e regras da casa (chave Pix, promoções, avisos).',
      'Teste uma conversa antes de ligar, veja as conversas e assuma o atendimento quando quiser.',
    ],
  },
  {
    to: '/admin/loja',
    label: 'Loja',
    title: 'Loja',
    short: 'Horários, entrega e pagamento',
    icon: SettingsIcon,
    does: [
      'Defina horários de funcionamento e o aviso vermelho do topo do site.',
      'Escolha a taxa de entrega, o pedido mínimo e as formas de pagamento aceitas.',
      'Troque o número de WhatsApp que recebe os pedidos.',
    ],
  },
  {
    to: '/admin/conteudo',
    label: 'Site',
    title: 'Conteúdo do site',
    short: 'Depoimentos e fotos',
    icon: ImageIcon,
    does: [
      'Cadastre depoimentos de clientes que aparecem no carrossel do site.',
      'Envie novas fotos para a galeria “Direto da chapa”.',
    ],
  },
  {
    to: '/admin/ajuda',
    label: 'Ajuda',
    title: 'Ajuda',
    short: 'Passo a passo e dúvidas',
    icon: HelpIcon,
    does: ['Roteiro do dia a dia e respostas para as dúvidas mais comuns.'],
  },
]
