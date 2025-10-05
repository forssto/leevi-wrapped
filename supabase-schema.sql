-- Leevi Wrapped Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create songs table
CREATE TABLE songs (
    song_order INTEGER PRIMARY KEY,
    track_name TEXT NOT NULL,
    album TEXT NOT NULL,
    year INTEGER NOT NULL,
    nrgm_list BOOLEAN DEFAULT FALSE,
    date DATE,
    song_length INTEGER,
    instrumental BOOLEAN DEFAULT FALSE,
    lyrics TEXT,
    analysis TEXT,
    main_lines TEXT,
    tags_adjective TEXT,
    tags_noun TEXT,
    sexual_themes INTEGER CHECK (sexual_themes >= 1 AND sexual_themes <= 3),
    pg13 INTEGER CHECK (pg13 >= 1 AND pg13 <= 3),
    cancel_target INTEGER CHECK (cancel_target >= 1 AND cancel_target <= 3),
    tragic_story INTEGER CHECK (tragic_story >= 1 AND tragic_story <= 3),
    escapism INTEGER CHECK (escapism >= 1 AND escapism <= 3),
    antihero INTEGER CHECK (antihero >= 1 AND antihero <= 3),
    lgbt INTEGER CHECK (lgbt >= 1 AND lgbt <= 3),
    substance_abuse INTEGER CHECK (substance_abuse >= 1 AND substance_abuse <= 3),
    lastfm_sum INTEGER,
    lastfm_pos INTEGER
);

-- Create participants table
CREATE TABLE participants (
    created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT PRIMARY KEY,
    name TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    decade TEXT CHECK (decade IN ('1950s', '1960s', '1970s', '1980s', '1990s', '2000s')),
    urban_rural TEXT CHECK (urban_rural IN ('urban', 'rural')),
    city TEXT,
    artist_relationship INTEGER CHECK (artist_relationship >= 1 AND artist_relationship <= 5),
    winner_prediction TEXT,
    hate_song TEXT,
    explicit_lyrics_relationship INTEGER CHECK (explicit_lyrics_relationship >= 1 AND explicit_lyrics_relationship <= 5),
    music_relationship INTEGER CHECK (music_relationship >= 1 AND music_relationship <= 5),
    works_in_music TEXT CHECK (works_in_music IN ('yes', 'no', 'sometimes')),
    plays_music TEXT CHECK (plays_music IN ('yes', 'no', 'sometimes')),
    format TEXT CHECK (format IN ('streaming', 'cd', 'vinyl', 'cassette', 'files', 'other')),
    project_endurance TEXT CHECK (project_endurance IN ('start', 'month or two', 'halfway', 'near the end', 'all the way')),
    participation_frequency TEXT CHECK (participation_frequency IN ('daily', 'weekly', 'monthly', 'once')),
    google_group BOOLEAN DEFAULT FALSE,
    nrgm BOOLEAN DEFAULT FALSE,
    done BOOLEAN DEFAULT FALSE,
    aft_nps TEXT CHECK (aft_nps IN ('detractor', 'neutral', 'promoter')),
    aft_artist_relationship INTEGER CHECK (aft_artist_relationship >= 1 AND aft_artist_relationship <= 5),
    aft_winner_prediction TEXT,
    aft_hate_song TEXT,
    aft_explicit_lyrics_relationship INTEGER CHECK (aft_explicit_lyrics_relationship >= 1 AND aft_explicit_lyrics_relationship <= 5),
    aft_reviewed_as_expected INTEGER CHECK (aft_reviewed_as_expected >= 1 AND aft_reviewed_as_expected <= 5),
    aft_influenced_by_others INTEGER CHECK (aft_influenced_by_others >= 1 AND aft_influenced_by_others <= 5)
);

-- Create reviews table
CREATE TABLE reviews (
    song_order INTEGER REFERENCES songs(song_order) ON DELETE CASCADE,
    song_title TEXT NOT NULL,
    participant_email TEXT REFERENCES participants(email) ON DELETE CASCADE,
    rating DECIMAL(4,2) NOT NULL CHECK (rating >= 4.0 AND rating <= 10.0),
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (song_order, participant_email)
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_participant_email ON reviews(participant_email);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_songs_year ON songs(year);
CREATE INDEX idx_songs_album ON songs(album);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Songs are readable by everyone
CREATE POLICY "Songs are viewable by everyone" ON songs
    FOR SELECT USING (true);

-- Participants can only see their own data
CREATE POLICY "Participants can view own data" ON participants
    FOR SELECT USING (auth.email() = email);

-- Reviews are readable by everyone (for analytics)
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

-- Only authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only the participant can update their own reviews
CREATE POLICY "Participants can update own reviews" ON reviews
    FOR UPDATE USING (auth.email() = participant_email);

-- Create a view for user stats (optional, for easier querying)
CREATE VIEW user_stats AS
SELECT 
    p.email,
    p.name,
    COUNT(r.rating) as total_reviews,
    AVG(r.rating) as average_rating,
    MIN(r.rating) as min_rating,
    MAX(r.rating) as max_rating,
    COUNT(DISTINCT s.album) as albums_reviewed
FROM participants p
LEFT JOIN reviews r ON p.email = r.participant_email
LEFT JOIN songs s ON r.song_order = s.song_order
GROUP BY p.email, p.name;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;