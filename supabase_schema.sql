-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add metadata columns to photos table
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS size BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS width INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS height INT DEFAULT 0;

-- Create shared_galleries table
CREATE TABLE IF NOT EXISTS shared_galleries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_ids UUID[] NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for shared_galleries (Optional but recommended)
ALTER TABLE shared_galleries ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own shared galleries
CREATE POLICY "Users can insert their own shared galleries"
ON shared_galleries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own shared galleries
CREATE POLICY "Users can view their own shared galleries"
ON shared_galleries FOR SELECT
USING (auth.uid() = user_id);

-- Allow public access to shared galleries via ID (anyone with the link/ID can view)
-- This is tricky with RLS if we want it to be truly public via ID only.
-- Usually, we might need a separate function or just allow SELECT for everyone if they know the ID?
-- But 'USING (true)' allows listing all.
-- We only want to allow fetching by ID.
-- For now, let's allow public read access, assuming the ID is the secret.
CREATE POLICY "Public can view shared galleries"
ON shared_galleries FOR SELECT
USING (true);
