const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateFunction() {
  try {
    // Read the updated function from the file
    const functionSQL = `
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
                WHEN 'works_in_music' THEN p.works_in_music = cohort_value::boolean
                WHEN 'plays_music' THEN p.plays_music = cohort_value::boolean
            END
    )
    SELECT 
        CASE 
            WHEN COUNT(cr.*) >= 3 THEN
                (COUNT(*) FILTER (WHERE cr.user_avg <= ur.user_avg) * 100.0 / COUNT(*))::numeric(5,2)
            ELSE NULL
        END as percentile,
        COUNT(cr.*) as cohort_size
    FROM cohort_ratings cr, user_rating ur;
END;
$$ LANGUAGE plpgsql;
    `
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: functionSQL })
    
    if (error) {
      console.error('Error updating function:', error)
    } else {
      console.log('Function updated successfully')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

updateFunction()
