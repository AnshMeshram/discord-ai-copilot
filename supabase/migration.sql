-- Quick Migration: Add Missing Columns for Phase 5
-- Run this in Supabase SQL Editor to fix the errors

-- Add role column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS role text;

-- Update existing messages to have role='user' (safe default)
UPDATE messages SET role = 'user' WHERE role IS NULL;

-- Drop existing constraint if present, then add it
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_role_check;
ALTER TABLE messages ADD CONSTRAINT messages_role_check CHECK (role IN ('user', 'assistant'));

-- Make role NOT NULL
ALTER TABLE messages ALTER COLUMN role SET NOT NULL;

-- Add last_message_at to summaries if missing (though it should exist)
ALTER TABLE summaries ADD COLUMN IF NOT EXISTS last_message_at timestamptz DEFAULT now();

-- Add message_count if missing
ALTER TABLE summaries ADD COLUMN IF NOT EXISTS message_count integer DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_summaries_updated_at ON summaries(updated_at DESC);

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'role';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'summaries' AND column_name IN ('message_count', 'last_message_at');
