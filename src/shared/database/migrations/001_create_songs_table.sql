-- Migration: Create songs table
-- Created: 2025-11-14

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    cover_image TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    midi_file TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for common queries
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_difficulty ON songs(difficulty);
CREATE INDEX idx_songs_created_at ON songs(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_songs_updated_at 
    BEFORE UPDATE ON songs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();