-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ site_contributions — what people gave us, in their words                 ║
-- ║                                                                          ║
-- ║ The premise change (2026-08-02) makes this the point of the site rather  ║
-- ║ than an afterthought. The corpus says argument does not convert: ~6      ║
-- ║ genuine concessions in 144,531 segments of Mike persuading friends in    ║
-- ║ person. So the success metric stops being "did they concede" and becomes ║
-- ║ "did they contribute" — which is achievable on the first visit.          ║
-- ║                                                                          ║
-- ║ This table IS the RSI input. Every conversation should end with an ask,  ║
-- ║ and what comes back drives what gets built next.                         ║
-- ║                                                                          ║
-- ║ Deliberately NOT public-readable. People say honest things here on the   ║
-- ║ understanding that it goes to Mike, not to a wall. Publishing any of it  ║
-- ║ needs their consent, asked for separately — the same rule the corpus     ║
-- ║ extraction already runs on.                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.site_contributions (
  id            uuid primary key default gen_random_uuid(),
  app           text not null,

  -- What they said, and what it was about.
  kind          text not null default 'objection'
                check (kind in ('objection', 'condition-for-trust', 'reaction', 'other')),
  body          text not null,

  -- Their ranked issues, so a contribution can be read against what they came in with.
  ranked        jsonb,

  -- Provenance without identity: which invite brought them, if any.
  invite_token  text,
  inviter_name  text,
  user_id       uuid references auth.users (id),

  -- Free-form context the client attaches (turn count, route, etc).
  meta          jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists site_contributions_app_created_idx
  on public.site_contributions (app, created_at desc);

-- RLS on, zero policies: the anon key can reach this ONLY through the RPC
-- below, which inserts and returns nothing. Nobody can read the pile back out
-- with a publishable key, including the person who wrote a row.
alter table public.site_contributions enable row level security;

create or replace function public.site_contribution_add(
  p_app     text,
  p_kind    text,
  p_body    text,
  p_ranked  jsonb default null,
  p_invite  text default null,
  p_inviter text default null,
  p_meta    jsonb default null
) returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_app is null or length(trim(p_app)) < 1 then
    raise exception 'invalid app';
  end if;
  if p_body is null or length(trim(p_body)) < 2 then
    return;   -- nothing to record; not an error worth showing a visitor
  end if;
  if length(p_body) > 8000 then
    raise exception 'too long';
  end if;
  if p_kind is null or p_kind not in ('objection','condition-for-trust','reaction','other') then
    p_kind := 'other';
  end if;

  insert into public.site_contributions
    (app, kind, body, ranked, invite_token, inviter_name, user_id, meta)
  values
    (trim(p_app), p_kind, trim(p_body), p_ranked,
     left(coalesce(p_invite,''), 64), left(coalesce(p_inviter,''), 80),
     auth.uid(), p_meta);
end $$;

revoke all on function public.site_contribution_add(text,text,text,jsonb,text,text,jsonb) from public;
grant execute on function public.site_contribution_add(text,text,text,jsonb,text,text,jsonb)
  to anon, authenticated;
