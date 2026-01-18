-- =====================================================================
-- DOMAIN EXTENSION: Ratings, Feedback, Favourites & Likes
-- =====================================================================

create table if not exists domain.enum_feedback_type (
  code text primary key check (code in ('RATING','BUG','FEATURE','GENERAL','COMPLAINT'))
);

insert into domain.enum_feedback_type(code)
values ('RATING'),('BUG'),('FEATURE'),('GENERAL'),('COMPLAINT')
on conflict do nothing;

-- Ratings for rental objects (post-booking)
create table if not exists domain.rental_object_ratings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  booking_id uuid null references domain.bookings(id) on delete set null,
  user_id uuid not null references platform.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, rental_object_id, user_id, booking_id)
);

-- General feedback items (bugs, features, complaints)
create table if not exists domain.feedback_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  type text not null references domain.enum_feedback_type(code),
  user_id uuid null references platform.users(id) on delete set null,
  booking_id uuid null references domain.bookings(id) on delete set null,
  rental_object_id uuid null references domain.rental_objects(id) on delete set null,
  title text null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null check (status in ('NEW','TRIAGED','IN_PROGRESS','DONE','REJECTED')) default 'NEW',
  created_at timestamptz not null default now()
);

-- Favourites (saved rental objects)
create table if not exists domain.favourites (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id, rental_object_id)
);

-- Likes (generic entity likes)
create table if not exists domain.likes (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('RENTAL_OBJECT','RATING','MESSAGE')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id, entity_type, entity_id)
);

comment on table domain.rental_object_ratings is 'User ratings and reviews for rental objects, typically post-booking';
comment on table domain.feedback_items is 'General feedback collection: bugs, feature requests, complaints';
comment on table domain.favourites is 'User-saved rental objects for quick access';
comment on table domain.likes is 'Generic like system for various entities';
