-- Complete schema migration to match current Supabase Cloud state
-- This migration creates the full schema with proper snake_case naming
-- and all tables as they exist in the current cloud database

-- Create tenant table (practice/clinic management)
CREATE TABLE IF NOT EXISTS tenant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT NOT NULL UNIQUE,
    custom_domain TEXT,
    logo TEXT,
    primary_color TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user table (system users)
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant_membership table (user-tenant relationships)
CREATE TABLE IF NOT EXISTS tenant_membership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    invited_at TIMESTAMPTZ,
    invited_by UUID,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- Create owner table (pet owners/customers)
CREATE TABLE IF NOT EXISTS owner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    title TEXT,
    address JSONB NOT NULL,
    preferred_practice TEXT,
    gdpr_consent BOOLEAN DEFAULT false,
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Create patient table (pets)
CREATE TABLE IF NOT EXISTS patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES owner(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    date_of_birth DATE,
    microchip_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emergency_contact table (emergency contacts for owners)
CREATE TABLE IF NOT EXISTS emergency_contact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES owner(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    relationship TEXT NOT NULL,
    is_authorized_for_medical_decisions BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit triggers function
CREATE OR REPLACE FUNCTION add_audit_triggers(target_table TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        CREATE OR REPLACE FUNCTION update_%I_updated_at()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
        CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_%I_updated_at();
    ', target_table, target_table, target_table, target_table, target_table, target_table);
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to all tables
SELECT add_audit_triggers('tenant');
SELECT add_audit_triggers('user');
SELECT add_audit_triggers('tenant_membership');
SELECT add_audit_triggers('owner');
SELECT add_audit_triggers('patient');
SELECT add_audit_triggers('emergency_contact');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_subdomain ON tenant(subdomain);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_tenant_membership_user_id ON tenant_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_membership_tenant_id ON tenant_membership(tenant_id);
CREATE INDEX IF NOT EXISTS idx_owner_tenant_id ON owner(tenant_id);
CREATE INDEX IF NOT EXISTS idx_owner_email ON owner(email);
CREATE INDEX IF NOT EXISTS idx_patient_owner_id ON patient(owner_id);
CREATE INDEX IF NOT EXISTS idx_patient_tenant_id ON patient(tenant_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contact_owner_id ON emergency_contact(owner_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contact_tenant_id ON emergency_contact(tenant_id);

-- Create GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_tenant_settings ON tenant USING GIN(settings);
CREATE INDEX IF NOT EXISTS idx_owner_address ON owner USING GIN(address);

-- Enable Row Level Security (RLS)
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contact ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE tenant IS 'Veterinary practices/clinics using the system';
COMMENT ON TABLE "user" IS 'System users (veterinarians, staff, admins)';
COMMENT ON TABLE tenant_membership IS 'User-tenant relationships with roles and permissions';
COMMENT ON TABLE owner IS 'Pet owners/customers';
COMMENT ON TABLE patient IS 'Pets belonging to owners';
COMMENT ON TABLE emergency_contact IS 'Emergency contacts for pet owners';

COMMENT ON COLUMN tenant.settings IS 'Practice-specific configuration and preferences';
COMMENT ON COLUMN owner.address IS 'Owner address stored as JSON with street, city, state, zip_code, country';
COMMENT ON COLUMN emergency_contact.is_authorized_for_medical_decisions IS 'Whether this contact can make medical decisions for the pets';