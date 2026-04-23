-- ============================================
-- BLOCKED HANDLES
-- ============================================

create table public.blocked_handles (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  created_at timestamptz not null default now(),

  constraint bh_handle_length check (char_length(handle) between 1 and 30),
  constraint bh_handle_format check (handle ~ '^[a-zA-Z0-9_]+$')
);

alter table public.blocked_handles enable row level security;
-- No public policies — admin only via service role

-- Pre-populate with reserved words
insert into public.blocked_handles (handle) values
  ('admin'), ('administrator'), ('support'), ('help'), ('api'),
  ('www'), ('mail'), ('email'), ('info'), ('contact'),
  ('psy'), ('psymarket'), ('psy_market'), ('official'), ('team'),
  ('staff'), ('moderator'), ('mod'), ('system'), ('bot'),
  ('null'), ('undefined'), ('anonymous'), ('anon'), ('guest'),
  ('root'), ('superuser'), ('super'), ('operator'),
  ('login'), ('signup'), ('register'), ('logout'), ('auth'),
  ('dashboard'), ('settings'), ('profile'), ('account'),
  ('shop'), ('store'), ('market'), ('marketplace'),
  ('security'), ('privacy'), ('terms'), ('legal'),
  ('news'), ('blog'), ('feed'), ('explore'), ('browse'),
  ('events'), ('festival'), ('music'), ('psytrance'), ('psy_trance');

-- ============================================
-- UPDATE handle_new_user TRIGGER
-- Priority: metadata handle > reserved handle for email > temp handle
-- ============================================

create or replace function handle_new_user()
returns trigger as $$
declare
  reserved_handle text;
  assigned_handle text;
  meta_handle text;
begin
  insert into public.users (id, role, email_notifications, created_at)
  values (new.id, 'user', true, now());

  meta_handle := lower(trim(coalesce(new.raw_user_meta_data->>'handle', '')));

  if meta_handle != '' then
    assigned_handle := meta_handle;
  else
    select handle into reserved_handle
    from public.reserved_handles
    where email = new.email
      and consumed = false
      and expires_at > now()
    order by reserved_at desc
    limit 1;

    if reserved_handle is not null then
      update public.reserved_handles
      set consumed = true, consumed_at = now()
      where email = new.email and handle = reserved_handle and consumed = false;

      assigned_handle := reserved_handle;
    else
      assigned_handle := 'user_' || substr(new.id::text, 1, 8);
    end if;
  end if;

  insert into public.profiles (user_id, type, handle, display_name, created_at, updated_at)
  values (
    new.id,
    'personal',
    assigned_handle,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    now(),
    now()
  );

  return new;
end;
$$ language plpgsql security definer;
