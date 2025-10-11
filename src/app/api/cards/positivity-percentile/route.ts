import { NextRequest } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user's average rating
    const { data: userStats, error: userError } = await supabase
      .from('mv_user_avg')
      .select('user_avg')
      .eq('email', userEmail)
      .single()

    if (userError || !userStats) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get overall average using SQL function
    const { data: allStatsData, error: allError } = await supabase
      .rpc('get_overall_average')

    console.log('Overall average result:', { allStatsData, allError })

    let allAvg = 0
    if (allError) {
      console.error('Error getting overall average:', allError)
      // Fallback: calculate from reviews table
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
      
      if (reviewsError) {
        return Response.json({ error: 'Failed to get overall stats' }, { status: 500 })
      }
      
      allAvg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    } else {
      allAvg = allStatsData?.[0]?.overall_avg || 0
    }

    // Get user's percentile rank using SQL function
    const { data: percentileData, error: percentileError } = await supabase
      .rpc('get_user_percentile', { user_email: userEmail })

    console.log('Percentile result:', { percentileData, percentileError })

    let percentile = 0
    if (percentileError) {
      console.error('Error getting percentile:', percentileError)
    } else {
      percentile = percentileData?.[0]?.percentile || 0
    }

    // Get cohort percentiles (only for cohorts with enough members)
    const { data: cohortStats, error: cohortError } = await supabaseAdmin
      .from('participants')
      .select('gender, decade, city, works_in_music, plays_music')
      .eq('email', userEmail)
      .single()

    let cohortPercentiles = {}
    
    console.log('Cohort stats:', cohortStats, 'Error:', cohortError)
    
    if (cohortError) {
      console.error('Failed to get cohort stats:', cohortError)
    }
    
    if (cohortStats && !cohortError) {
      // Get gender percentile
      const { data: genderPercentile, error: genderError } = await supabaseAdmin
        .rpc('get_cohort_percentile', { 
          user_email: userEmail, 
          cohort_type: 'gender',
          cohort_value: cohortStats.gender
        })
      
      console.log('Gender percentile:', genderPercentile, 'Error:', genderError)
      if (genderError) {
        console.error('Gender percentile error:', genderError)
      }
      
      // Get decade percentile
      const { data: decadePercentile, error: decadeError } = await supabaseAdmin
        .rpc('get_cohort_percentile', { 
          user_email: userEmail, 
          cohort_type: 'decade',
          cohort_value: cohortStats.decade
        })
      
      console.log('Decade percentile:', decadePercentile, 'Error:', decadeError)
      if (decadeError) {
        console.error('Decade percentile error:', decadeError)
      }

      // Get city percentile
      const { data: cityPercentile, error: cityError } = await supabaseAdmin
        .rpc('get_cohort_percentile', { 
          user_email: userEmail, 
          cohort_type: 'city',
          cohort_value: cohortStats.city
        })
      
      console.log('City percentile:', cityPercentile, 'Error:', cityError)
      if (cityError) {
        console.error('City percentile error:', cityError)
      }

      // Get musician comparisons
      let worksInMusicPercentile = null
      let playsMusicPercentile = null
      
      if (cohortStats.works_in_music) {
        const { data: worksInMusicData } = await supabaseAdmin
          .rpc('get_cohort_percentile', { 
            user_email: userEmail, 
            cohort_type: 'works_in_music',
            cohort_value: cohortStats.works_in_music
          })
        worksInMusicPercentile = worksInMusicData?.[0]?.percentile || null
      }
      
      if (cohortStats.plays_music) {
        const { data: playsMusicData } = await supabaseAdmin
          .rpc('get_cohort_percentile', { 
            user_email: userEmail, 
            cohort_type: 'plays_music',
            cohort_value: cohortStats.plays_music
          })
        playsMusicPercentile = playsMusicData?.[0]?.percentile || null
      }

      cohortPercentiles = {
        gender: genderPercentile?.[0]?.percentile || null,
        decade: decadePercentile?.[0]?.percentile || null,
        city: cityPercentile?.[0]?.percentile || null,
        works_in_music: worksInMusicPercentile,
        plays_music: playsMusicPercentile
      }
      
      // Filter out null values
      cohortPercentiles = Object.fromEntries(
        Object.entries(cohortPercentiles).filter(([, value]) => value !== null)
      )
      
      console.log('Final cohort percentiles:', cohortPercentiles)
      console.log('Cohort stats used:', {
        gender: cohortStats.gender,
        decade: cohortStats.decade,
        city: cohortStats.city,
        works_in_music: cohortStats.works_in_music,
        plays_music: cohortStats.plays_music
      })
    }

        return Response.json({
          user_avg: parseFloat(userStats.user_avg),
          all_avg: allAvg,
          all_percentile: percentile,
          cohort_percentiles: cohortPercentiles,
          cohort_stats: cohortStats || null
        })

  } catch (error) {
    console.error('Error in positivity percentile:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
