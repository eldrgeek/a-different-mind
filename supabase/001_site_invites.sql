-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ site_invites — app-scoped named invite links + QR                        ║
-- ║                                                                          ║
-- ║ Generalized from the community-seed `seed_invites` pair, which is        ║
-- ║ hardcoded to one app and REQUIRES a signed-in inviter. Two differences:  ║
-- ║                                                                          ║
-- ║  1. `app` column, so every SOMA property shares one invite mechanism     ║
-- ║     instead of each growing its own table.                              ║
-- ║  2. An inviter may be ANONYMOUS. Mike's ask: an invite from someone who  ║
-- ║     named themselves means more than a random link, and the page should  ║
-- ║     say so either way — "Mike Wolf invited you" vs "Someone who didn't   ║
-- ║     want to say who they were invited you." That second case has to be   ║
-- ║     creatable, so auth is optional here and inviter_name is nullable.    ║
-- ║                                                                          ║
-- ║ FOLLOW-UP (not done here, deliberately): community-seed's `seed_invites` ║
-- ║ should migrate onto this table. It is a live surface of another app and  ║
-- ║ refactoring it was not this session's call.                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.site_invites (
  id            uuid primary key default gen_random_uuid(),
  app           text not null,
  -- hex, not base64url: this Postgres rejects 'base64url' as an encoding, and
  -- plain base64 would put +/= in a URL. 12 bytes = 96 bits, 24 chars.
  token         text not null unique
                default encode(gen_random_bytes(12), 'hex'),
  inviter_id    uuid references auth.users (id),   -- null = anonymous
  inviter_name  text,                              -- null = declined to say
  created_at    timestamptz not null default now(),
  use_count     integer not null default 0,
  last_used_at  timestamptz
);

create index if not exists site_invites_app_token_idx
  on public.site_invites (app, token);

-- No direct table access at all. Everything goes through the two RPCs below,
-- so an anon key can mint and read an invite but can never enumerate them.
alter table public.site_invites enable row level security;

-- ── create ────────────────────────────────────────────────────────────────
-- Signed in + a name  → the invite carries the name.
-- Signed in, no name  → anonymous invite (they chose not to say).
-- Not signed in       → anonymous invite.
create or replace function public.site_invite_create(p_app text, p_name text default null)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_token text;
  v_name  text;
begin
  if p_app is null or length(trim(p_app)) < 1 or length(trim(p_app)) > 64 then
    raise exception 'invalid app';
  end if;

  v_name := nullif(trim(coalesce(p_name, '')), '');
  if v_name is not null and length(v_name) > 80 then
    raise exception 'inviter name too long';
  end if;

  -- An anonymous caller cannot claim a name — otherwise anyone could mint an
  -- invite that says "Mike Wolf invited you".
  if auth.uid() is null then
    v_name := null;
  end if;

  insert into public.site_invites (app, inviter_id, inviter_name)
  values (trim(p_app), auth.uid(), v_name)
  returning site_invites.token into v_token;

  return v_token;
end $$;

-- ── lookup ────────────────────────────────────────────────────────────────
-- Returns one row. inviter_name IS NULL means "someone who didn't say".
-- Returns no rows means the token isn't recognized — a different message.
create or replace function public.site_invite_lookup(p_app text, p_token text)
returns table (inviter_name text, created_at timestamptz)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_token is null or length(p_token) > 64 or p_app is null then
    return;
  end if;

  update public.site_invites si
     set use_count = si.use_count + 1, last_used_at = now()
   where si.token = p_token and si.app = p_app;

  return query
    select si.inviter_name, si.created_at
      from public.site_invites si
     where si.token = p_token and si.app = p_app;
end $$;

revoke all on function public.site_invite_create(text, text) from public;
revoke all on function public.site_invite_lookup(text, text) from public;
grant execute on function public.site_invite_create(text, text) to anon, authenticated;
grant execute on function public.site_invite_lookup(text, text) to anon, authenticated;
