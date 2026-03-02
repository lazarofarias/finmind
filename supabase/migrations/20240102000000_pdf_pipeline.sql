-- =============================================================
-- FINMIND – Parte 3: PDF Pipeline Schema & Storage
-- Cole no SQL Editor do Supabase APÓS o script principal.
-- =============================================================

-- ─────────────────────────────────────────
-- 1. TABELA pdf_uploads
-- ─────────────────────────────────────────
create type public.pdf_upload_status as enum ('pending', 'processing', 'done', 'error');

create table public.pdf_uploads (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  file_path               text not null,
  original_name           text not null,
  status                  public.pdf_upload_status not null default 'pending',
  extracted_transactions  jsonb default '[]',
  error_logs              text,
  bank_detected           text,
  created_at              timestamptz default now() not null,
  updated_at              timestamptz default now() not null
);

create index idx_pdf_uploads_user_id on public.pdf_uploads(user_id);
create index idx_pdf_uploads_status  on public.pdf_uploads(user_id, status);

create trigger trg_pdf_uploads_updated_at
  before update on public.pdf_uploads
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.pdf_uploads enable row level security;

create policy "pdf_uploads: select próprio"
  on public.pdf_uploads for select using (auth.uid() = user_id);

create policy "pdf_uploads: insert próprio"
  on public.pdf_uploads for insert with check (auth.uid() = user_id);

create policy "pdf_uploads: update próprio"
  on public.pdf_uploads for update using (auth.uid() = user_id);

create policy "pdf_uploads: delete próprio"
  on public.pdf_uploads for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 2. SUPABASE STORAGE BUCKET "statements"
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('statements', 'statements', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Policy: usuário acessa apenas sua pasta /user_id/
create policy "statements: select próprio"
  on storage.objects for select
  using (bucket_id = 'statements' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "statements: insert próprio"
  on storage.objects for insert
  with check (bucket_id = 'statements' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "statements: delete próprio"
  on storage.objects for delete
  using (bucket_id = 'statements' and auth.uid()::text = (storage.foldername(name))[1]);
