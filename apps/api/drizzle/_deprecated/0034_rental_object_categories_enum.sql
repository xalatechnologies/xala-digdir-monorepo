-- =====================================================================
-- RENTAL OBJECT CATEGORIES - Canonical Enum
-- =====================================================================
-- Migration: 0034_rental_object_categories_enum
-- Purpose: Enforce canonical rental object categories at database level
-- Date: 2026-01-17
-- Reference: docs/roles/prd.md Section 2.1
--
-- Categories (Norwegian terminology - AUTHORITATIVE):
--   1. Lokaler og baner (Spaces and fields)
--   2. Arrangementer og tjenester (Events and services)
--   3. Utstyr og kjøretøy (Equipment and vehicles)
-- =====================================================================

-- Create canonical category enum table
create table if not exists domain.enum_rental_object_category (
  code text primary key check (code in (
    'LOKALER_OG_BANER',
    'ARRANGEMENTER_OG_TJENESTER', 
    'UTSTYR_OG_KJORETOY'
  )),
  name_nb text not null,
  name_en text not null,
  description_nb text null,
  description_en text null,
  sort_order int not null default 0
);

-- Seed canonical categories
insert into domain.enum_rental_object_category(code, name_nb, name_en, description_nb, description_en, sort_order) values
  (
    'LOKALER_OG_BANER',
    'Lokaler og baner',
    'Spaces and Fields',
    'Fysiske rom og idrettsanlegg: Idrettshaller, gymsaler, kultursaler, møterom, fotballbaner, tennisbaner',
    'Physical spaces and sports facilities: Sports halls, gyms, cultural halls, meeting rooms, football fields, tennis courts',
    1
  ),
  (
    'ARRANGEMENTER_OG_TJENESTER',
    'Arrangementer og tjenester',
    'Events and Services',
    'Tidsbaserte tilbud: Kurs, workshops, kulturarrangementer, kommunale tjenester med påmelding',
    'Time-based offerings: Courses, workshops, cultural events, municipal services with registration',
    2
  ),
  (
    'UTSTYR_OG_KJORETOY',
    'Utstyr og kjøretøy',
    'Equipment and Vehicles',
    'Flyttbare eiendeler: Lyd- og lysutstyr, sportsutstyr, tilhengere, minibusser',
    'Movable assets: Sound and lighting equipment, sports equipment, trailers, minibuses',
    3
  )
on conflict (code) do nothing;

-- Add category_code column to rental_objects table
-- Note: Keeping existing category_id for backward compatibility during transition
alter table domain.rental_objects 
  add column if not exists category_code text null references domain.enum_rental_object_category(code);

-- Create index for category filtering
create index if not exists idx_rental_objects_category_code 
  on domain.rental_objects(category_code) where category_code is not null;

-- Add comment for documentation
comment on table domain.enum_rental_object_category is 
  'Canonical rental object categories enforced at database level. Three categories only: Lokaler og baner, Arrangementer og tjenester, Utstyr og kjøretøy. Reference: PRD v1.0 Section 2.1';

comment on column domain.rental_objects.category_code is 
  'Canonical category code. Will eventually replace category_id. Use enum_rental_object_category for valid values.';
