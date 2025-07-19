-- Create animal_comment table for reusable comments system
CREATE TABLE animal_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animal(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general' CHECK (comment_type IN ('general', 'medical', 'behavioral')),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_animal_comment_animal_id ON animal_comment(animal_id);
CREATE INDEX idx_animal_comment_user_id ON animal_comment(user_id);
CREATE INDEX idx_animal_comment_tenant_id ON animal_comment(tenant_id);
CREATE INDEX idx_animal_comment_created_at ON animal_comment(created_at);

-- Enable Row Level Security
ALTER TABLE animal_comment ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view comments for animals in their tenant
CREATE POLICY "Users can view animal comments in their tenant" ON animal_comment
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM "user" WHERE id = auth.uid()
    )
  );

-- Users can insert comments for animals in their tenant
CREATE POLICY "Users can insert animal comments in their tenant" ON animal_comment
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM "user" WHERE id = auth.uid()
    ) AND
    user_id = auth.uid()
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own animal comments" ON animal_comment
  FOR UPDATE USING (
    user_id = auth.uid() AND
    tenant_id = (
      SELECT tenant_id FROM "user" WHERE id = auth.uid()
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own animal comments" ON animal_comment
  FOR DELETE USING (
    user_id = auth.uid() AND
    tenant_id = (
      SELECT tenant_id FROM "user" WHERE id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_animal_comment_updated_at 
  BEFORE UPDATE ON animal_comment 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();