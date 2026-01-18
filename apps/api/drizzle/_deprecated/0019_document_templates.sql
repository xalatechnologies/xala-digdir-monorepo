-- =====================================================================
-- 0019: DOCUMENT TEMPLATES & GENERATION
-- Email/PDF templates, versioning, variable substitution
-- =====================================================================

-- Enum: Template Types
create table if not exists domain.enum_template_type (
  code text primary key check (code in ('EMAIL','PDF','SMS','NOTIFICATION'))
);

insert into domain.enum_template_type(code) values 
  ('EMAIL'),('PDF'),('SMS'),('NOTIFICATION')
on conflict do nothing;

-- Enum: Template Categories
create table if not exists domain.enum_template_category (
  code text primary key check (code in (
    'BOOKING_CONFIRMATION','BOOKING_CANCELLATION','BOOKING_REMINDER',
    'APPROVAL_GRANTED','APPROVAL_REJECTED',
    'INVOICE','RECEIPT','CONTRACT',
    'CASE_CREATED','CASE_RESOLVED',
    'NOTIFICATION','SYSTEM'
  ))
);

insert into domain.enum_template_category(code) values 
  ('BOOKING_CONFIRMATION'),('BOOKING_CANCELLATION'),('BOOKING_REMINDER'),
  ('APPROVAL_GRANTED'),('APPROVAL_REJECTED'),
  ('INVOICE'),('RECEIPT'),('CONTRACT'),
  ('CASE_CREATED'),('CASE_RESOLVED'),
  ('NOTIFICATION'),('SYSTEM')
on conflict do nothing;

-- =====================================================================
-- Templates (Master)
-- =====================================================================

create table if not exists domain.templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  code text not null,
  name text not null,
  description text null,
  
  template_type text not null references domain.enum_template_type(code),
  category text not null references domain.enum_template_category(code),
  
  -- Active version reference
  active_version_id uuid null,
  
  is_system boolean not null default false,
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, code)
);

create index if not exists idx_templates_tenant_type on domain.templates(tenant_id, template_type, is_active);
create index if not exists idx_templates_category on domain.templates(category, is_active);

comment on table domain.templates is 'Master template definitions';
comment on column domain.templates.is_system is 'System templates cannot be deleted (only customized)';

-- =====================================================================
-- Template Versions (Immutable Snapshots)
-- =====================================================================

create table if not exists domain.template_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  template_id uuid not null references domain.templates(id) on delete cascade,
  
  version integer not null,
  
  locale text not null references platform.enum_locale(code),
  
  -- Content
  subject text null, -- For email templates
  body text not null, -- Supports Handlebars syntax
  layout text null, -- Optional layout wrapper
  
  -- Metadata
  variables jsonb not null default '[]'::jsonb, -- List of available variables
  
  -- Publishing
  status text not null check (status in ('DRAFT','PUBLISHED','ARCHIVED')) default 'DRAFT',
  published_at timestamptz null,
  published_by uuid null references platform.users(id) on delete set null,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  
  unique (tenant_id, template_id, version, locale)
);

create index if not exists idx_template_versions_template on domain.template_versions(template_id, status);
create index if not exists idx_template_versions_published on domain.template_versions(status, published_at);

comment on table domain.template_versions is 'Immutable template versions with full localization support';
comment on column domain.template_versions.body is 'Handlebars template with {{variable}} syntax';
comment on column domain.template_versions.variables is 'JSON array of {name, type, description, required}';

-- Link active version back to template
alter table domain.templates
  add constraint templates_active_version_fk
  foreign key (active_version_id) references domain.template_versions(id) on delete set null;

-- =====================================================================
-- Generated Documents (Rendered Templates)
-- =====================================================================

create table if not exists domain.generated_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  template_version_id uuid not null references domain.template_versions(id) on delete restrict,
  
  -- Related entities
  booking_id uuid null references domain.bookings(id) on delete set null,
  case_id uuid null references domain.cases(id) on delete set null,
  user_id uuid null references platform.users(id) on delete set null,
  
  document_type text not null references domain.enum_template_type(code),
  
  -- Rendered content
  rendered_subject text null,
  rendered_body text not null,
  
  -- PDF-specific
  pdf_url text null, -- S3/storage URL
  pdf_size_bytes bigint null,
  
  -- Delivery tracking
  sent_at timestamptz null,
  sent_to text null, -- Email/phone
  delivery_status text check (delivery_status in ('PENDING','SENT','DELIVERED','FAILED','BOUNCED')) default 'PENDING',
  delivery_error text null,
  
  -- Audit
  generated_at timestamptz not null default now(),
  generated_by uuid null references platform.users(id) on delete set null,
  
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_generated_docs_tenant on domain.generated_documents(tenant_id, generated_at desc);
create index if not exists idx_generated_docs_booking on domain.generated_documents(booking_id);
create index if not exists idx_generated_docs_case on domain.generated_documents(case_id);
create index if not exists idx_generated_docs_user on domain.generated_documents(user_id);
create index if not exists idx_generated_docs_delivery on domain.generated_documents(delivery_status, sent_at);

comment on table domain.generated_documents is 'Rendered template instances with delivery tracking';
comment on column domain.generated_documents.rendered_body is 'Final rendered content with all variables substituted';

-- =====================================================================
-- Trigger: Auto-update updated_at
-- =====================================================================

create trigger templates_updated_at before update on domain.templates
  for each row execute function domain.update_updated_at_column();

-- =====================================================================
-- Seed System Templates (Norwegian + English)
-- =====================================================================

-- Booking Confirmation Template
do $$
declare
  v_tenant_id uuid;
  v_template_id uuid;
  v_version_id uuid;
begin
  for v_tenant_id in select id from platform.tenants limit 10 loop
    -- Create template
    insert into domain.templates (tenant_id, code, name, template_type, category, is_system)
    values (v_tenant_id, 'booking_confirmation', 'Booking Confirmation', 'EMAIL', 'BOOKING_CONFIRMATION', true)
    returning id into v_template_id;
    
    -- Norwegian version
    insert into domain.template_versions (
      tenant_id, template_id, version, locale, subject, body, variables, status, published_at, created_by
    )
    values (
      v_tenant_id, v_template_id, 1, 'nb',
      'Booking bekreftet: {{rentalObject.name}}',
      E'Hei {{user.name}},\n\nDin booking er bekreftet!\n\nDetaljer:\n- Objekt: {{rentalObject.name}}\n- Fra: {{booking.startTime}}\n- Til: {{booking.endTime}}\n- Total pris: {{booking.totalPrice}}\n\nMed vennlig hilsen,\n{{tenant.name}}',
      '[{"name":"user.name","type":"string"},{"name":"rentalObject.name","type":"string"},{"name":"booking.startTime","type":"datetime"},{"name":"booking.endTime","type":"datetime"},{"name":"booking.totalPrice","type":"money"}]'::jsonb,
      'PUBLISHED',
      now(),
      (select id from platform.users where tenant_id = v_tenant_id limit 1)
    )
    returning id into v_version_id;
    
    -- Set as active version
    update domain.templates set active_version_id = v_version_id where id = v_template_id;
    
    -- English version
    insert into domain.template_versions (
      tenant_id, template_id, version, locale, subject, body, variables, status, published_at, created_by
    )
    values (
      v_tenant_id, v_template_id, 1, 'en',
      'Booking confirmed: {{rentalObject.name}}',
      E'Hi {{user.name}},\n\nYour booking is confirmed!\n\nDetails:\n- Object: {{rentalObject.name}}\n- From: {{booking.startTime}}\n- To: {{booking.endTime}}\n- Total price: {{booking.totalPrice}}\n\nBest regards,\n{{tenant.name}}',
      '[{"name":"user.name","type":"string"},{"name":"rentalObject.name","type":"string"},{"name":"booking.startTime","type":"datetime"},{"name":"booking.endTime","type":"datetime"},{"name":"booking.totalPrice","type":"money"}]'::jsonb,
      'PUBLISHED',
      now(),
      (select id from platform.users where tenant_id = v_tenant_id limit 1)
    );
  end loop;
end $$;

comment on schema domain is 'Domain-specific business logic tables';
