-- Add emergency contacts field to Owner table
-- This field will store an array of emergency contact objects as JSONB

ALTER TABLE "Owner" 
ADD COLUMN "emergencyContacts" JSONB DEFAULT NULL;

-- Add a check constraint to ensure valid emergency contact structure
ALTER TABLE "Owner" 
ADD CONSTRAINT check_emergency_contacts_structure 
CHECK (
  "emergencyContacts" IS NULL OR (
    jsonb_typeof("emergencyContacts") = 'array' AND
    jsonb_array_length("emergencyContacts") <= 5
  )
);

-- Create an index for efficient querying of emergency contacts
CREATE INDEX IF NOT EXISTS idx_owner_emergency_contacts 
ON "Owner" USING GIN ("emergencyContacts");

-- Add comment explaining the field structure
COMMENT ON COLUMN "Owner"."emergencyContacts" IS 'Array of emergency contact objects, max 5 contacts. Each contact has optional name, phone, and relationship fields.';