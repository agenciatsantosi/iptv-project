-- Drop existing table if it exists
DROP TABLE IF EXISTS channels;

-- Create channels table with updated schema
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    logo TEXT,
    type TEXT,
    group_name TEXT,
    description TEXT,
    year INTEGER,
    rating NUMERIC,
    duration INTEGER,
    genres TEXT[],
    cast_members TEXT[],
    director TEXT,
    country TEXT,
    language TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX channels_user_id_idx ON channels(user_id);
CREATE INDEX channels_type_idx ON channels(type);
CREATE INDEX channels_group_name_idx ON channels(group_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own channels
CREATE POLICY "Users can view their own channels"
    ON channels FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own channels
CREATE POLICY "Users can insert their own channels"
    ON channels FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own channels
CREATE POLICY "Users can update their own channels"
    ON channels FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own channels
CREATE POLICY "Users can delete their own channels"
    ON channels FOR DELETE
    USING (auth.uid() = user_id);
