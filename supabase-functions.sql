-- Leevi Wrapped SQL Functions
-- Run this in your Supabase SQL editor

-- Function to get overall average rating
CREATE OR REPLACE FUNCTION get_overall_average()
RETURNS TABLE(overall_avg numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT AVG(rating)::numeric(5,2) as overall_avg
    FROM reviews;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's percentile rank
CREATE OR REPLACE FUNCTION get_user_percentile(user_email text)
RETURNS TABLE(percentile numeric) AS $$
BEGIN
    RETURN QUERY
    WITH user_rating AS (
        SELECT user_avg FROM mv_user_avg WHERE email = user_email
    ),
    all_ratings AS (
        SELECT user_avg FROM mv_user_avg
    )
    SELECT 
        (COUNT(*) FILTER (WHERE a.user_avg <= u.user_avg) * 100.0 / COUNT(*))::numeric(5,2) as percentile
    FROM all_ratings a, user_rating u;
END;
$$ LANGUAGE plpgsql;

-- Function to get cohort percentile
CREATE OR REPLACE FUNCTION get_cohort_percentile(
    user_email text,
    cohort_type text,
    cohort_value text
)
RETURNS TABLE(percentile numeric, cohort_size bigint) AS $$
BEGIN
    RETURN QUERY
    WITH user_rating AS (
        SELECT ua.user_avg 
        FROM mv_user_avg ua
        JOIN participants p ON ua.email = p.email
        WHERE ua.email = user_email
    ),
    cohort_ratings AS (
        SELECT ua.user_avg
        FROM mv_user_avg ua
        JOIN participants p ON ua.email = p.email
        WHERE 
            CASE cohort_type
                WHEN 'gender' THEN p.gender = cohort_value
                WHEN 'decade' THEN p.decade = cohort_value
                WHEN 'city' THEN p.city = cohort_value
            END
    )
    SELECT 
        CASE 
            WHEN COUNT(cr.*) >= 5 THEN
                (COUNT(*) FILTER (WHERE cr.user_avg <= ur.user_avg) * 100.0 / COUNT(*))::numeric(5,2)
            ELSE NULL
        END as percentile,
        COUNT(cr.*) as cohort_size
    FROM cohort_ratings cr, user_rating ur;
END;
$$ LANGUAGE plpgsql;

-- Function to get album superfan/nemesis data
CREATE OR REPLACE FUNCTION get_album_preferences(user_email text)
RETURNS TABLE(
    fav_album text,
    fav_album_user_avg numeric,
    users_who_liked_fav_more bigint,
    worst_album text,
    worst_album_user_avg numeric,
    users_who_liked_worst_less bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH user_albums AS (
        SELECT album, album_avg
        FROM mv_user_album_avg
        WHERE email = user_email
    ),
    fav_album AS (
        SELECT album, album_avg
        FROM user_albums
        ORDER BY album_avg DESC
        LIMIT 1
    ),
    worst_album AS (
        SELECT album, album_avg
        FROM user_albums
        ORDER BY album_avg ASC
        LIMIT 1
    )
    SELECT 
        fa.album as fav_album,
        fa.album_avg as fav_album_user_avg,
        (SELECT COUNT(*) 
         FROM mv_user_album_avg uaa
         WHERE uaa.album = fa.album AND uaa.album_avg > fa.album_avg) as users_who_liked_fav_more,
        wa.album as worst_album,
        wa.album_avg as worst_album_user_avg,
        (SELECT COUNT(*) 
         FROM mv_user_album_avg uaa
         WHERE uaa.album = wa.album AND uaa.album_avg < wa.album_avg) as users_who_liked_worst_less
    FROM fav_album fa, worst_album wa;
END;
$$ LANGUAGE plpgsql;

-- Function to get hot take index
CREATE OR REPLACE FUNCTION get_hot_take_index(user_email text)
RETURNS TABLE(
    hot_take_index numeric,
    rank_percentile numeric,
    top_hot_takes json
) AS $$
BEGIN
    RETURN QUERY
    WITH user_deltas AS (
        SELECT 
            r.song_order,
            r.rating,
            csa.crowd_avg,
            ABS(r.rating - csa.crowd_avg) as abs_delta
        FROM reviews r
        JOIN mv_crowd_song_avg csa ON r.song_order = csa.song_order
        WHERE r.participant_email = user_email
    ),
    hot_take_index AS (
        SELECT AVG(abs_delta)::numeric(5,2) as hti
        FROM user_deltas
    ),
    user_percentile AS (
        SELECT 
            (COUNT(*) FILTER (WHERE ud.abs_delta <= hti.hti) * 100.0 / COUNT(*))::numeric(5,2) as percentile
        FROM user_deltas ud, hot_take_index hti
    ),
    top_hot_takes AS (
        SELECT json_agg(
            json_build_object(
                'song_order', ud.song_order,
                'track_name', s.track_name,
                'user_rating', ud.rating,
                'crowd_avg', ud.crowd_avg,
                'delta', (ud.rating - ud.crowd_avg)::numeric(5,2)
            )
        ) as hot_takes
        FROM (
            SELECT * FROM user_deltas
            ORDER BY abs_delta DESC
            LIMIT 5
        ) ud
        JOIN songs s ON ud.song_order = s.song_order
    )
    SELECT 
        hti.hti as hot_take_index,
        up.percentile as rank_percentile,
        tt.hot_takes as top_hot_takes
    FROM hot_take_index hti, user_percentile up, top_hot_takes tt;
END;
$$ LANGUAGE plpgsql;

-- Function to get era bias
CREATE OR REPLACE FUNCTION get_era_bias(user_email text)
RETURNS TABLE(
    decade_ratings json,
    best_decade text,
    worst_decade text
) AS $$
BEGIN
    RETURN QUERY
    WITH decade_stats AS (
        SELECT 
            decade,
            decade_avg,
            decade_review_count
        FROM mv_user_era_stats
        WHERE email = user_email
        ORDER BY decade
    ),
    best_worst AS (
        SELECT 
            (SELECT decade FROM decade_stats ORDER BY decade_avg DESC LIMIT 1) as best_decade,
            (SELECT decade FROM decade_stats ORDER BY decade_avg ASC LIMIT 1) as worst_decade
    )
    SELECT 
        (SELECT json_agg(
            json_build_object(
                'decade', decade,
                'avg_rating', decade_avg,
                'review_count', decade_review_count
            )
        ) FROM decade_stats) as decade_ratings,
        bw.best_decade,
        bw.worst_decade
    FROM best_worst bw;
END;
$$ LANGUAGE plpgsql;

-- Function to get popularity reversal data
CREATE OR REPLACE FUNCTION get_popularity_reversal(user_email text)
RETURNS TABLE(
    corr_popularity numeric,
    hidden_gems json,
    overrated_by_world json
) AS $$
BEGIN
    RETURN QUERY
    WITH user_songs AS (
        SELECT 
            s.song_order,
            s.track_name,
            s.lastfm_pos,
            r.rating
        FROM songs s
        JOIN reviews r ON s.song_order = r.song_order
        WHERE r.participant_email = user_email 
        AND s.lastfm_pos IS NOT NULL
    ),
    popularity_corr AS (
        SELECT CORR(rating, (-1.0)*lastfm_pos)::numeric(5,3) as corr
        FROM user_songs
    ),
    hidden_gems AS (
        SELECT json_agg(
            json_build_object(
                'song_order', song_order,
                'track_name', track_name,
                'user_rating', rating,
                'lastfm_pos', lastfm_pos
            )
        ) as gems
        FROM (
            SELECT * FROM user_songs
            ORDER BY rating DESC, lastfm_pos DESC
            LIMIT 3
        ) hg
    ),
    overrated AS (
        SELECT json_agg(
            json_build_object(
                'song_order', song_order,
                'track_name', track_name,
                'user_rating', rating,
                'lastfm_pos', lastfm_pos
            )
        ) as overrated
        FROM (
            SELECT * FROM user_songs
            ORDER BY rating ASC, lastfm_pos ASC
            LIMIT 3
        ) ov
    )
    SELECT 
        pc.corr as corr_popularity,
        hg.gems as hidden_gems,
        ov.overrated as overrated_by_world
    FROM popularity_corr pc, hidden_gems hg, overrated ov;
END;
$$ LANGUAGE plpgsql;

-- Function to get prediction report card
CREATE OR REPLACE FUNCTION get_prediction_report(user_email text)
RETURNS TABLE(
    predicted_song text,
    user_rating_of_predicted numeric,
    user_percentile_for_predicted numeric,
    crowd_avg_of_predicted numeric,
    crowd_rank_of_predicted bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH user_prediction AS (
        SELECT winner_prediction
        FROM participants
        WHERE email = user_email
    ),
    predicted_song_data AS (
        SELECT 
            s.song_order,
            s.track_name
        FROM songs s
        JOIN user_prediction up ON s.track_name = up.winner_prediction
        LIMIT 1
    ),
    user_rating AS (
        SELECT r.rating
        FROM reviews r
        JOIN predicted_song_data psd ON r.song_order = psd.song_order
        WHERE r.participant_email = user_email
    ),
    user_percentile AS (
        SELECT 
            (COUNT(*) FILTER (WHERE r.rating <= ur.rating) * 100.0 / COUNT(*))::numeric(5,2) as percentile
        FROM reviews r, user_rating ur
        WHERE r.participant_email = user_email
    ),
    crowd_data AS (
        SELECT 
            csa.crowd_avg,
            csr.crowd_rank
        FROM mv_crowd_song_avg csa
        JOIN mv_crowd_song_rank csr ON csa.song_order = csr.song_order
        JOIN predicted_song_data psd ON csa.song_order = psd.song_order
    )
    SELECT 
        psd.track_name as predicted_song,
        ur.rating as user_rating_of_predicted,
        up.percentile as user_percentile_for_predicted,
        cd.crowd_avg as crowd_avg_of_predicted,
        cd.crowd_rank as crowd_rank_of_predicted
    FROM predicted_song_data psd, user_rating ur, user_percentile up, crowd_data cd;
END;
$$ LANGUAGE plpgsql;
