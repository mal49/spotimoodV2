-- Migration to add category and metadata columns to existing feedback table
-- Run this in your Supabase SQL Editor

-- Add the new columns to the existing feedback table
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add a comment to document the changes
COMMENT ON COLUMN feedback.category IS 'Detailed category like mood-detection, playlist-quality, etc.';
COMMENT ON COLUMN feedback.metadata IS 'Additional structured data like would_recommend, improvement_suggestions';

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'feedback' 
ORDER BY ordinal_position; 