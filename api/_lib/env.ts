/** Variáveis de ambiente do servidor (configuradas no painel da Vercel; nada disso vai para o navegador). */
export const env = {
  anthropicKey: () => process.env.ANTHROPIC_API_KEY ?? '',
  supabaseUrl: () => process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
  supabaseServiceKey: () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  waToken: () => process.env.WHATSAPP_TOKEN ?? '',
  waPhoneId: () => process.env.WHATSAPP_PHONE_ID ?? '',
  waVerifyToken: () => process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  waAppSecret: () => process.env.META_APP_SECRET ?? '',
  /** Transcrição de áudio (qualquer serviço com a API compatível com a da OpenAI: OpenAI, Groq…). */
  transcribeKey: () => process.env.TRANSCRIBE_API_KEY ?? '',
  transcribeUrl: () => process.env.TRANSCRIBE_URL ?? 'https://api.openai.com/v1/audio/transcriptions',
  transcribeModel: () => process.env.TRANSCRIBE_MODEL ?? 'whisper-1',
  cronSecret: () => process.env.CRON_SECRET ?? '',
  /** Modelo aprovado na Meta para o resumo diário (opcional; permite mandar fora da janela de 24 h). */
  summaryTemplate: () => process.env.WHATSAPP_SUMMARY_TEMPLATE ?? '',
  graphVersion: () => process.env.WHATSAPP_GRAPH_VERSION ?? 'v21.0',
  storeName: () => process.env.STORE_NAME ?? 'Moriá Hamburgueria',
  storeAddress: () => process.env.STORE_ADDRESS ?? 'Rio Verde de Mato Grosso/MS',
  storeSite: () => process.env.STORE_SITE_URL ?? '',
  storeInstagram: () => process.env.STORE_INSTAGRAM ?? 'moria_hamburgueria',
  timezone: () => process.env.STORE_TZ ?? 'America/Campo_Grande',
}

export interface Readiness {
  anthropic: boolean
  supabase: boolean
  whatsapp: boolean
  signature: boolean
  transcricao: boolean
}

export const readiness = (): Readiness => ({
  anthropic: Boolean(env.anthropicKey()),
  supabase: Boolean(env.supabaseUrl() && env.supabaseServiceKey()),
  whatsapp: Boolean(env.waToken() && env.waPhoneId() && env.waVerifyToken()),
  signature: Boolean(env.waAppSecret()),
  transcricao: Boolean(env.transcribeKey()),
})
