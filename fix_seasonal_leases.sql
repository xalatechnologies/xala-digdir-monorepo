CREATE TABLE domain.seasonal_leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  tenant_id uuid NOT NULL,
  rental_object_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  start_date timestamp NOT NULL,
  end_date timestamp NOT NULL,
  weekdays jsonb DEFAULT '[]'::jsonb,
  start_time varchar(10) NOT NULL,
  end_time varchar(10) NOT NULL,
  status varchar(50) DEFAULT 'active' NOT NULL,
  total_price numeric(10, 2) DEFAULT '0',
  currency varchar(3) DEFAULT 'NOK' NOT NULL,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

ALTER TABLE domain.seasonal_leases 
  ADD CONSTRAINT seasonal_leases_tenant_id_tenants_id_fk 
  FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id) ON DELETE cascade;

ALTER TABLE domain.seasonal_leases 
  ADD CONSTRAINT seasonal_leases_rental_object_id_rental_objects_id_fk 
  FOREIGN KEY (rental_object_id) REFERENCES domain.rental_objects(id) ON DELETE cascade;

ALTER TABLE domain.seasonal_leases 
  ADD CONSTRAINT seasonal_leases_organization_id_organizations_id_fk 
  FOREIGN KEY (organization_id) REFERENCES platform.organizations(id) ON DELETE cascade;

CREATE INDEX seasonal_leases_tenant_idx ON domain.seasonal_leases USING btree (tenant_id);
CREATE INDEX seasonal_leases_rental_object_idx ON domain.seasonal_leases USING btree (rental_object_id);
CREATE INDEX seasonal_leases_org_idx ON domain.seasonal_leases USING btree (organization_id);
