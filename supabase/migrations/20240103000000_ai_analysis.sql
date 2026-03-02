-- =============================================================
-- FINMIND – Parte 4: AI Analysis Schema
-- Execute no SQL Editor do Supabase após os scripts anteriores.
-- =============================================================

-- ─────────────────────────────────────────
-- 1. Coluna de feedback em ai_insights
-- ─────────────────────────────────────────
alter table public.ai_insights
  add column if not exists feedback smallint, -- 1=útil, -1=não útil, null=sem feedback
  add column if not exists feedback_at timestamptz;

-- ─────────────────────────────────────────
-- 2. Cash flow snapshots (histórico de projeções)
-- ─────────────────────────────────────────
create table if not exists public.cash_flow_snapshots (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  snapshot_date               date not null default current_date,
  actual_balance              numeric(15,2) not null,
  projected_month_end_balance numeric(15,2) not null,
  projected_30d_balance       numeric(15,2) not null,
  burn_rate_daily             numeric(10,2) not null,
  savings_rate_percent        numeric(5,2) not null,
  financial_score             smallint not null,
  created_at                  timestamptz default now() not null,

  unique (user_id, snapshot_date)
);

create index idx_cash_flow_snapshots_user_date
  on public.cash_flow_snapshots(user_id, snapshot_date desc);

alter table public.cash_flow_snapshots enable row level security;

create policy "snapshots: select próprio"
  on public.cash_flow_snapshots for select
  using (auth.uid() = user_id);

create policy "snapshots: insert próprio"
  on public.cash_flow_snapshots for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 3. Supabase pg_cron (Cron Job diário)
-- (Requer extensão pg_cron habilitada no Supabase Dashboard)
-- ─────────────────────────────────────────
-- select cron.schedule(
--   'finmind-daily-analysis',
--   '0 6 * * *',  -- Todos os dias às 06:00 UTC (03:00 BRT)
--   $$
--     select net.http_post(
--       url := 'https://<project>.supabase.co/functions/v1/analyze-finances',
--       headers := '{"Authorization": "Bearer <service_role_key>", "Content-Type": "application/json"}'::jsonb,
--       body := '{}'::jsonb
--     );
--   $$
-- );
--
-- Para ver crons agendados:
-- select * from cron.job;
--
-- Para remover:
-- select cron.unschedule('finmind-daily-analysis');
