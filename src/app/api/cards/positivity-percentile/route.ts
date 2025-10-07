import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

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
      .select('user_avg, total_reviews')
      .eq('email', userEmail)
      .single()

    if (userError || !userStats) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get overall average
    const { data: allStats, error: allError } = await supabase
      .rpc('get_overall_average')

    if (allError) {
      // Fallback: calculate from reviews table
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
      
      if (reviewsError) {
        return Response.json({ error: 'Failed to get overall stats' }, { status: 500 })
      }
      
      const allAvg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      allStats = { overall_avg: allAvg }
    }

    // Get user's percentile rank
    const { data: percentileData, error: percentileError } = await supabase
      .rpc('get_user_percentile', { user_email: userEmail })

    if (percentileError) {
      return Response.json({ error: 'Failed to calculate percentile' }, { status: 500 })
    }

    // Get cohort percentiles (only for cohorts with enough members)
    const { data: cohortStats, error: cohortError } = await supabase
      .from('participants')
      .select('gender, decade, city')
      .eq('email', userEmail)
      .single()

    let cohortPercentiles = {}
    if (cohortStats && !cohortError) {
      // Get gender percentile
      const { data: genderPercentile } = await supabase
        .rpc('get_cohort_percentile', { 
          user_email: userEmail, 
          cohort_type: 'gender',
          cohort_value: cohortStats.gender
        })
      
      // Get decade percentile
      const { data: decadePercentile } = await supabase
        .rpc('get_cohort_percentile', { 
          user_email: userEmail, 
          cohort_type: 'decade',
          cohort_value: cohortStats.decade
        })

      // Get city percentile
      const { data: cityPercentile } = await supabase
        .rpc('get_cohort_percentile', { 
          user_email: userEmail, 
          cohort_type: 'city',
          cohort_value: cohortStats.city
        })

      cohortPercentiles = {
        gender: genderPercentile,
        decade: decadePercentile,
        city: cityPercentile
      }
    }

    return Response.json({
      user_avg: parseFloat(userStats.user_avg),
      total_reviews: userStats.total_reviews,
      all_avg: parseFloat(allStats.overall_avg),
      all_percentile: percentileData?.percentile || 0,
      cohort_percentiles: cohortPercentiles
    })

  } catch (error) {
    console.error('Error in positivity percentile:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
