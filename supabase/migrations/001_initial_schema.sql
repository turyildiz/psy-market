-- ============================================
-- psy.market Database Schema
-- Version: 1.3 (Supabase + Umbrella Model)
-- Source: SPEC.md v1.3
-- ============================================

-- Enable required extensions
create extension if not exists "pg_cron" with schema "pg_catalog";

-- ============================================
-- ENUMS
-- ============================================

create type user_role as enum ('user', 'admin', 'super_admin');
create type profile_type as enum ('personal', 'artist', 'label', 'festival');
create type listing_status as enum ('draft', 'pending', 'active', 'sold', 'rejected');
create type listing_condition as enum ('new', 'like_new', 'good', 'worn', 'vintage');
create type listing_category as enum ('clothing', 'accessories', 'gear', 'art', 'other');

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends auth.users — private account data)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  email_notifications boolean not null default true,
  stripe_account_id text,  -- V2
  created_at timestamptz not null default now()
);

-- Profiles table (public personas)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type profile_type not null default 'personal',
  handle text not null unique,
  display_name text not null,
  bio text,
  avatar_url text,
  header_url text,  -- V2
  location text,
  social_links jsonb default '{}',
  is_creator boolean not null default false,
  is_verified boolean not null default false,  -- V2
  is_suspended boolean not null default false,  -- Admin Kill Switch
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint handle_length check (char_length(handle) between 3 and 30),
  constraint handle_format check (handle ~ '^[a-zA-Z0-9_]+$'),
  constraint display_name_length check (char_length(display_name) between 1 and 100),
  constraint bio_length check (bio is null or char_length(bio) <= 500),
  constraint location_length check (location is null or char_length(location) <= 100)
);

-- Listings table
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price integer not null,  -- EUR cents
  condition listing_condition not null,
  size text not null,
  images text[] not null default '{}',
  category listing_category not null,
  tags text[] not null default '{}',
  ships_to text[] not null default '{}',
  status listing_status not null default 'draft',
  admin_notes text,
  is_featured boolean not null default false,
  view_count integer not null default 0,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint title_length check (char_length(title) between 5 and 100),
  constraint description_length check (char_length(description) between 20 and 2000),
  constraint price_range check (price between 50 and 5000000),
  constraint size_length check (char_length(size) between 1 and 20)
);

-- Messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  thread_id text not null,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  receiver_profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  images text[] default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now(),

  constraint content_length check (char_length(content) between 1 and 2000)
);

-- Events table (festivals — admin-managed)
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  start_date date not null,
  end_date date not null,
  country text not null,
  venue text,
  website_url text,
  cover_image_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_name_length check (char_length(name) between 3 and 100),
  constraint event_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint event_venue_length check (venue is null or char_length(venue) <= 200),
  constraint event_dates_valid check (end_date >= start_date)
);

-- Vendor Events (profile ↔ event link)
create table public.vendor_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(profile_id, event_id)
);

-- Event Notifications ("Notify Me" subscriptions)
create table public.event_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(profile_id, event_id)
);

-- Favorites table (V2 prep — schema only, no UI in V1)
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(profile_id, listing_id)
);

-- Reserved handles table (Handle Lock — consumed on signup)
create table public.reserved_handles (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  email text not null,
  reserved_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  consumed boolean not null default false,
  consumed_at timestamptz,

  constraint rh_handle_length check (char_length(handle) between 3 and 30),
  constraint rh_handle_format check (handle ~ '^[a-zA-Z0-9_]+$')
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_handle on public.profiles(handle);

create index idx_listings_profile_id on public.listings(profile_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_category on public.listings(category);
create index idx_listings_status_created on public.listings(status, created_at desc);
create index idx_listings_featured on public.listings(is_featured, status);
create index idx_listings_status_submitted on public.listings(status, submitted_at);

create index idx_messages_thread_id on public.messages(thread_id, created_at);
create index idx_messages_receiver_read on public.messages(receiver_profile_id, read);
create index idx_messages_listing_id on public.messages(listing_id);
create index idx_messages_sender on public.messages(sender_profile_id);

create index idx_events_start_date on public.events(start_date);
create index idx_events_slug on public.events(slug);

create index idx_vendor_events_profile_id on public.vendor_events(profile_id);
create index idx_vendor_events_event_id on public.vendor_events(event_id);

create index idx_event_notifications_event_id on public.event_notifications(event_id);
create index idx_event_notifications_profile_id on public.event_notifications(profile_id);
create index idx_event_notifications_pending on public.event_notifications(notified_at) where notified_at is null;

create index idx_favorites_profile_id on public.favorites(profile_id);
create index idx_favorites_listing_id on public.favorites(listing_id);

create index idx_reserved_handles_email on public.reserved_handles(email);
create index idx_reserved_handles_expires on public.reserved_handles(expires_at) where consumed = false;

-- ============================================
-- FULL-TEXT SEARCH
-- ============================================

alter table public.listings add column search_vector tsvector;

create index idx_listings_search on public.listings using gin(search_vector);

-- Trigger to keep search_vector in sync (to_tsvector is not immutable, so we can't use GENERATED ALWAYS AS)
create or replace function update_listing_search_vector()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger tr_listings_search_vector
  before insert or update of title, description, tags on public.listings
  for each row execute function update_listing_search_vector();

-- ============================================
-- AUTO-UPDATED TIMESTAMPS
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

create trigger tr_listings_updated_at
  before update on public.listings
  for each row execute function update_updated_at();

create trigger tr_events_updated_at
  before update on public.events
  for each row execute function update_updated_at();

-- ============================================
-- AUTH TRIGGER: Auto-create user + profile on signup
-- ============================================

create or replace function handle_new_user()
returns trigger as $$
declare
  reserved_handle text;
  assigned_handle text;
begin
  -- Create public.users record
  insert into public.users (id, role, email_notifications, created_at)
  values (new.id, 'user', true, now());

  -- Handle Lock: check if this email has a reserved handle
  select handle into reserved_handle
  from public.reserved_handles
  where email = new.email
    and consumed = false
    and expires_at > now()
  order by reserved_at desc
  limit 1;

  if reserved_handle is not null then
    -- Consume the reservation
    update public.reserved_handles
    set consumed = true, consumed_at = now()
    where email = new.email and handle = reserved_handle and consumed = false;

    assigned_handle := reserved_handle;
  else
    -- Fallback: temporary handle (user sets permanent handle during onboarding)
    assigned_handle := 'user_' || substr(new.id::text, 1, 8);
  end if;

  -- Create default profile
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;
alter table public.vendor_events enable row level security;
alter table public.event_notifications enable row level security;
alter table public.reserved_handles enable row level security;
alter table public.favorites enable row level security;

-- USERS policies
create policy "Users can read their own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Service role can manage all users"
  on public.users for all
  using (auth.jwt()->>'role' = 'service_role');

-- PROFILES policies
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update their own profiles"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert their own profiles"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- LISTINGS policies
create policy "Active and sold listings are publicly readable"
  on public.listings for select
  using (
    status in ('active', 'sold')
    or profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can create listings for their own profiles"
  on public.listings for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can update their own listings"
  on public.listings for update
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can delete their own draft listings"
  on public.listings for delete
  using (
    status = 'draft'
    and profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Kill Switch: Suspended profiles cannot create listings
create policy "Suspended profiles cannot insert listings"
  on public.listings for insert
  with check (
    not exists (
      select 1 from public.profiles
      where id = profile_id and is_suspended = true
    )
  );

-- MESSAGES policies
create policy "Users can read messages they sent or received"
  on public.messages for select
  using (
    sender_profile_id in (select id from public.profiles where user_id = auth.uid())
    or receiver_profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (
    sender_profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can mark messages as read"
  on public.messages for update
  using (
    receiver_profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Kill Switch: Suspended profiles cannot send messages
create policy "Suspended profiles cannot send messages"
  on public.messages for insert
  with check (
    not exists (
      select 1 from public.profiles
      where id = sender_profile_id and is_suspended = true
    )
  );

-- EVENTS policies
create policy "Events are publicly readable"
  on public.events for select
  using (true);

-- Events insert/update/delete via service role client (admin only)

-- VENDOR EVENTS policies
create policy "Vendor events are publicly readable"
  on public.vendor_events for select
  using (true);

create policy "Users can add themselves to events"
  on public.vendor_events for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can remove themselves from events"
  on public.vendor_events for delete
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- EVENT NOTIFICATIONS policies
create policy "Users can manage their own event notifications"
  on public.event_notifications for select
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can subscribe to event notifications"
  on public.event_notifications for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Users can unsubscribe from event notifications"
  on public.event_notifications for delete
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- FAVORITES policies
create policy "Users can manage their own favorites"
  on public.favorites for all
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- reserved_handles: no public policies.
-- Managed by handle_new_user() trigger (security definer) and admin via service role client.

-- ADMIN override: admin operations use the service role client (bypasses RLS)

-- ============================================
-- STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('listings', 'listings', true);
insert into storage.buckets (id, name, public) values ('messages', 'messages', false);
insert into storage.buckets (id, name, public) values ('events', 'events', true);

-- Avatars bucket: authenticated users can upload to their own folder
create policy "Avatar upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Avatar public read" on storage.objects for select
  using (bucket_id = 'avatars');

-- Listings bucket: authenticated users can upload
create policy "Listing image upload" on storage.objects for insert
  with check (bucket_id = 'listings' and auth.role() = 'authenticated');

create policy "Listing image public read" on storage.objects for select
  using (bucket_id = 'listings');

-- Messages bucket: authenticated users can upload
create policy "Message image upload" on storage.objects for insert
  with check (bucket_id = 'messages' and auth.role() = 'authenticated');

create policy "Message image read by participants" on storage.objects for select
  using (bucket_id = 'messages' and auth.role() = 'authenticated');

-- Events bucket: admin upload via service role client (bypasses policies)
create policy "Event cover public read" on storage.objects for select
  using (bucket_id = 'events');

-- ============================================
-- CRON JOBS
-- ============================================

-- Auto-approve pending listings after 24 hours
select cron.schedule(
  'auto-approve-pending-listings',
  '0 * * * *',
  $$
  update public.listings
  set status = 'active', updated_at = now()
  where status = 'pending'
  and submitted_at < now() - interval '24 hours'
  $$
);

-- Cleanup expired reserved handles (monthly)
select cron.schedule(
  'cleanup-expired-reserved-handles',
  '0 3 1 * *',
  $$
  delete from public.reserved_handles
  where consumed = false
  and expires_at < now()
  $$
);
