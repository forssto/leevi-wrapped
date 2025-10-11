-- Leevi Wrapped Materialized Views for Performance
-- Run this in your Supabase SQL editor

-- 1) Crowd average per song
DROP MATERIALIZED VIEW IF EXISTS mv_crowd_song_avg;
CREATE MATERIALIZED VIEW mv_crowd_song_avg AS
SELECT 
    song_order, 
    AVG(rating)::numeric(5,2) as crowd_avg,
    COUNT(*) as review_count
FROM reviews 
GROUP BY song_order;

-- 2) Crowd rank per song
DROP MATERIALIZED VIEW IF EXISTS mv_crowd_song_rank;
CREATE MATERIALIZED VIEW mv_crowd_song_rank AS
SELECT 
    song_order,
    crowd_avg,
    RANK() OVER (ORDER BY crowd_avg DESC) as crowd_rank
FROM mv_crowd_song_avg;

-- 3) Per-user album averages (for Album Superfan/Nemesis)
DROP MATERIALIZED VIEW IF EXISTS mv_user_album_avg;
CREATE MATERIALIZED VIEW mv_user_album_avg AS
SELECT 
    r.participant_email as email, 
    s.album, 
    AVG(r.rating)::numeric(5,2) as album_avg,
    COUNT(*) as review_count
FROM reviews r 
JOIN songs s USING (song_order)
GROUP BY r.participant_email, s.album;

-- 4) Per-user overall average (for Positivity Percentile)
DROP MATERIALIZED VIEW IF EXISTS mv_user_avg;
CREATE MATERIALIZED VIEW mv_user_avg AS
SELECT 
    participant_email as email, 
    AVG(rating)::numeric(5,2) as user_avg,
    COUNT(*) as total_reviews,
    STDDEV(rating)::numeric(5,2) as rating_stddev
FROM reviews 
GROUP BY participant_email;

-- 5) Cohort sizes (for privacy - only show cohorts with enough members)
DROP VIEW IF EXISTS v_cohort_sizes;
CREATE VIEW v_cohort_sizes AS
SELECT 
    gender, 
    decade,
    city,
    COUNT(*) as n_members
FROM participants 
WHERE done = true
GROUP BY gender, decade, city;

-- 6) User review timing data (for Cadence Archetype)
DROP MATERIALIZED VIEW IF EXISTS mv_user_review_timing;
CREATE MATERIALIZED VIEW mv_user_review_timing AS
SELECT 
    r.participant_email as email,
    r.song_order,
    r.rating,
    r.time as review_time,
    s.date as song_date,
    EXTRACT(hour FROM r.time) as review_hour,
    EXTRACT(dow FROM r.time) as review_day_of_week,
    (DATE(r.time) - s.date) as lag_days
FROM reviews r
JOIN songs s USING (song_order);

-- 7) User theme correlations (for Theme Affinities)
DROP MATERIALIZED VIEW IF EXISTS mv_user_theme_stats;
CREATE MATERIALIZED VIEW mv_user_theme_stats AS
SELECT 
    r.participant_email as email,
    AVG(r.rating) as user_avg_rating,
    CORR(r.rating, s.sexual_themes::float) as corr_sexual,
    CORR(r.rating, s.pg13::float) as corr_pg13,
    CORR(r.rating, s.tragic_story::float) as corr_tragic,
    CORR(r.rating, s.escapism::float) as corr_escapism,
    CORR(r.rating, s.antihero::float) as corr_antihero,
    CORR(r.rating, s.lgbt::float) as corr_lgbt,
    CORR(r.rating, s.substance_abuse::float) as corr_substance,
    CORR(r.rating, s.song_length::float) as corr_length
FROM reviews r
JOIN songs s USING (song_order)
GROUP BY r.participant_email;

-- 8) User era preferences (for Era Bias)
DROP MATERIALIZED VIEW IF EXISTS mv_user_era_stats;
CREATE MATERIALIZED VIEW mv_user_era_stats AS
SELECT 
    r.participant_email as email,
    (s.year/10)*10 as decade,
    AVG(r.rating)::numeric(5,2) as decade_avg,
    COUNT(*) as decade_review_count
FROM reviews r 
JOIN songs s USING (song_order)
GROUP BY r.participant_email, (s.year/10)*10;

-- 9) User popularity correlation (for Popularity Reversal)
DROP MATERIALIZED VIEW IF EXISTS mv_user_popularity_stats;
CREATE MATERIALIZED VIEW mv_user_popularity_stats AS
SELECT 
    r.participant_email as email,
    CORR(r.rating, (-1.0)*s.lastfm_pos) as corr_popularity,
    COUNT(*) as songs_with_lastfm
FROM reviews r
JOIN songs s USING (song_order)
WHERE s.lastfm_pos IS NOT NULL
GROUP BY r.participant_email;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mv_crowd_song_avg_song_order ON mv_crowd_song_avg(song_order);
CREATE INDEX IF NOT EXISTS idx_mv_user_album_avg_email ON mv_user_album_avg(email);
CREATE INDEX IF NOT EXISTS idx_mv_user_avg_email ON mv_user_avg(email);
CREATE INDEX IF NOT EXISTS idx_mv_user_review_timing_email ON mv_user_review_timing(email);
CREATE INDEX IF NOT EXISTS idx_mv_user_theme_stats_email ON mv_user_theme_stats(email);
CREATE INDEX IF NOT EXISTS idx_mv_user_era_stats_email ON mv_user_era_stats(email);
CREATE INDEX IF NOT EXISTS idx_mv_user_popularity_stats_email ON mv_user_popularity_stats(email);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON mv_crowd_song_avg TO anon, authenticated;
GRANT SELECT ON mv_crowd_song_rank TO anon, authenticated;
GRANT SELECT ON mv_user_album_avg TO anon, authenticated;
GRANT SELECT ON mv_user_avg TO anon, authenticated;
GRANT SELECT ON mv_user_review_timing TO anon, authenticated;
GRANT SELECT ON mv_user_theme_stats TO anon, authenticated;
GRANT SELECT ON mv_user_era_stats TO anon, authenticated;
GRANT SELECT ON mv_user_popularity_stats TO anon, authenticated;
GRANT SELECT ON v_cohort_sizes TO anon, authenticated;

-- Overall album averages (crowd averages for albums)
DROP MATERIALIZED VIEW IF EXISTS mv_crowd_album_avg;
CREATE MATERIALIZED VIEW mv_crowd_album_avg AS
SELECT 
    s.album,
    AVG(r.rating)::numeric(5,2) as crowd_avg,
    COUNT(r.rating) as review_count
FROM reviews r
JOIN songs s ON r.song_order = s.song_order
WHERE s.album IS NOT NULL 
  AND s.album != 'Single'
GROUP BY s.album
ORDER BY crowd_avg DESC;

CREATE INDEX IF NOT EXISTS idx_mv_crowd_album_avg_album ON mv_crowd_album_avg(album);

-- Grant permissions
GRANT SELECT ON mv_crowd_album_avg TO anon, authenticated;

-- Refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_wrapped_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_crowd_song_avg;
    REFRESH MATERIALIZED VIEW mv_crowd_song_rank;
    REFRESH MATERIALIZED VIEW mv_user_album_avg;
    REFRESH MATERIALIZED VIEW mv_crowd_album_avg;
    REFRESH MATERIALIZED VIEW mv_user_avg;
    REFRESH MATERIALIZED VIEW mv_user_review_timing;
    REFRESH MATERIALIZED VIEW mv_user_theme_stats;
    REFRESH MATERIALIZED VIEW mv_user_era_stats;
    REFRESH MATERIALIZED VIEW mv_user_popularity_stats;
END;
$$ LANGUAGE plpgsql;
