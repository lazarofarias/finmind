# FinMind

**Ecossistema de controle financeiro pessoal com Inteligência Artificial**

> Next.js 16 · TypeScript · Supabase · OpenAI GPT-4o · Edge Functions

---

## Demo

Acesse `http://localhost:3000` → clique em **"Explorar o demo sem login →"** para ver o dashboard com dados fictícios sem precisar configurar nada.

---

## Funcionalidades

| Módulo | Status |
|--------|--------|
| Autenticação (login/registro/logout)
| Dashboard com fluxo de caixa
| Ingestão de PDF (Nubank, Itaú, Inter...)
| Mentor IA (anomalias, score, projeções)
| Contas, Transações, Investimentos
| Mobile-first (PWA ready)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend:** Supabase (Postgres + RLS + Edge Functions + Storage)
- **IA:** OpenAI GPT-4o-mini (análise financeira + extração de PDF)
- **Email:** Resend (alertas críticos)
- **Charts:** Recharts

---

## 📦 Instalação

```bash
git clone https://github.com/lazarofarias/finmind.git
cd finmind
npm install
```

### Configurar variáveis de ambiente

Renomeie `.env.local` e preencha com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
OPENAI_API_KEY=sua_openai_key
RESEND_API_KEY=sua_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Executar o banco de dados

Execute os arquivos em `supabase/migrations/` na ordem no SQL Editor do Supabase:

1. `20240102000000_pdf_pipeline.sql`
2. `20240103000000_ai_analysis.sql`

### Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Edge Functions (Supabase)

Deploy das funções:

```bash
supabase functions deploy process-pdf
supabase functions deploy analyze-finances
```

Variáveis de ambiente nas Edge Functions (Supabase Dashboard → Settings → Edge Functions):
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## Estrutura

```
finmind/
├── app/
│   ├── (app)/          # Rotas protegidas (dashboard, ai-mentor, etc.)
│   ├── (auth)/         # Login e cadastro
│   └── demo/           # Demo público sem autenticação
├── features/
│   ├── ai-mentor/      # InsightFeed, FinancialScoreCard, CashFlowTrendChart
│   ├── dashboard/      # BalanceCard, CashFlowChart, UpcomingFixed
│   ├── pdf-import/     # FileUploader, ReviewClient
│   └── transactions/   # QuickAddDialog, actions
├── supabase/
│   ├── functions/      # Edge Functions (Deno/TypeScript)
│   └── migrations/     # SQL migrations
└── types/
    └── database.types.ts
```

---

## Licença

MIT © [Lázaro Farias](https://github.com/lazarofarias)
