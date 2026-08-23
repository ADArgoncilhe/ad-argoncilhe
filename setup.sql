-- 1) Criar a tabela de conteúdos
create table if not exists public.team_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2) Ativar Row Level Security
alter table public.team_content enable row level security;

-- 3) Apagar políticas anteriores com os mesmos nomes, caso existam
 drop policy if exists "public can read team content" on public.team_content;
 drop policy if exists "authenticated can insert team content" on public.team_content;
 drop policy if exists "authenticated can update team content" on public.team_content;

-- 4) Pais: leitura pública apenas
create policy "public can read team content"
on public.team_content
for select
to anon, authenticated
using (true);

-- 5) Só utilizadores autenticados podem criar/alterar conteúdo
create policy "authenticated can insert team content"
on public.team_content
for insert
to authenticated
with check (true);

create policy "authenticated can update team content"
on public.team_content
for update
to authenticated
using (true)
with check (true);

-- 6) Conteúdo inicial
insert into public.team_content (id, content)
values (
  'main',
  '{
    "season":"2026/27",
    "teamName":"Equipa Sub-10",
    "nextTraining":{"date":"25 AGO","time":"18:00","place":"Centro Social de Argoncilhe","tag":"PRÉ-ÉPOCA"},
    "notice":{"title":"Início da pré-época","text":"Os treinos começam no dia 25 de agosto às 18:00. Chegar 15 minutos antes."},
    "trainings":[
      {"day":"Terça","date":"25 AGO","title":"Treino","time":"18:00","place":"Centro Social de Argoncilhe"},
      {"day":"Quinta","date":"27 AGO","title":"Treino","time":"18:00","place":"Centro Social de Argoncilhe"},
      {"day":"Terça","date":"01 SET","title":"Treino","time":"18:00","place":"Centro Social de Argoncilhe"}
    ],
    "games":[
      {"date":"29 AGO","day":"Sáb","home":"AD Argoncilhe","away":"Adversário","time":"10:00","place":"Local a confirmar","type":"AMIGÁVEL"},
      {"date":"15 SET","day":"Ter","home":"AD Argoncilhe","away":"Adversário","time":"Hora a confirmar","place":"Local a confirmar","type":"AMIGÁVEL"}
    ],
    "calendar":[
      {"date":"01/09","activity":"Treino · 18:00","place":"Centro Social"},
      {"date":"03/09","activity":"Treino · 18:00","place":"Centro Social"},
      {"date":"08/09","activity":"Amigável · 18:00","place":"A confirmar"},
      {"date":"10/09","activity":"Treino · 18:00","place":"Centro Social"}
    ],
    "teamNote":"Aqui poderemos acrescentar depois o plantel e a convocatória sem expor dados pessoais publicamente."
  }'::jsonb
)
on conflict (id) do nothing;
