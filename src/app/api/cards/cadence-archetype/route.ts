import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user's review timing data
    const { data: timingData, error: timingError } = await supabase
      .from('mv_user_review_timing')
      .select('*')
      .eq('email', userEmail)

    if (timingError) {
      console.error('Error getting timing data:', timingError)
      return Response.json({ error: 'Failed to get timing data' }, { status: 500 })
    }

    if (!timingData || timingData.length === 0) {
      return Response.json({ error: 'No timing data found for user' }, { status: 404 })
    }

    // Analyze review patterns
    const reviews = timingData

    // 1. Hour of day analysis
    const hourCounts = new Map<number, number>()
    reviews.forEach(review => {
      const hour = review.review_hour
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })

    const mostActiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0

    // 2. Day of week analysis (0 = Sunday, 1 = Monday, etc.)
    const dayCounts = new Map<number, number>()
    reviews.forEach(review => {
      const day = review.review_day_of_week
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
    })

    const mostActiveDay = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0

    // 3. Lag analysis (days between song release and review)
    const lagDays = reviews.map(r => r.lag_days).filter(lag => lag !== null)
    const avgLag = lagDays.length > 0 ? lagDays.reduce((sum, lag) => sum + lag, 0) / lagDays.length : 0
    const medianLag = lagDays.length > 0 ? lagDays.sort((a, b) => a - b)[Math.floor(lagDays.length / 2)] : 0

    // 4. Review frequency analysis
    const reviewDates = reviews.map(r => new Date(r.review_time).toDateString())
    const uniqueDates = new Set(reviewDates)
    const totalDays = uniqueDates.size
    const reviewsPerDay = reviews.length / Math.max(totalDays, 1)

    // 5. Determine archetype based on patterns
    let archetype = 'Balanced Reviewer'
    let archetypeDescription = 'You review songs at a steady pace'
    let archetypeEmoji = '⚖️'

    if (avgLag < 1) {
      archetype = 'Early Bird'
      archetypeDescription = 'You review songs almost immediately after release'
      archetypeEmoji = '🐦'
    } else if (avgLag > 30) {
      archetype = 'Late Bloomer'
      archetypeDescription = 'You take your time to digest songs before reviewing'
      archetypeEmoji = '🌱'
    } else if (reviewsPerDay > 5) {
      archetype = 'Binge Reviewer'
      archetypeDescription = 'You review many songs in concentrated sessions'
      archetypeEmoji = '🎯'
    } else if (reviewsPerDay < 1) {
      archetype = 'Thoughtful Reviewer'
      archetypeDescription = 'You take time between reviews to reflect'
      archetypeEmoji = '🤔'
    }

    // 6. Time preference analysis
    let timePreference = 'Balanced'
    if (mostActiveHour >= 6 && mostActiveHour < 12) {
      timePreference = 'Morning Person'
    } else if (mostActiveHour >= 12 && mostActiveHour < 18) {
      timePreference = 'Afternoon Enthusiast'
    } else if (mostActiveHour >= 18 && mostActiveHour < 22) {
      timePreference = 'Evening Listener'
    } else {
      timePreference = 'Night Owl'
    }

    // 7. Day preference analysis
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayPreference = dayNames[mostActiveDay]

    return Response.json({
      archetype,
      archetype_description: archetypeDescription,
      archetype_emoji: archetypeEmoji,
      time_preference: timePreference,
      day_preference: dayPreference,
      most_active_hour: mostActiveHour,
      most_active_day: mostActiveDay,
      avg_lag_days: avgLag,
      median_lag_days: medianLag,
      reviews_per_day: reviewsPerDay,
      total_days: totalDays,
      hour_distribution: Object.fromEntries(hourCounts),
      day_distribution: Object.fromEntries(dayCounts)
    })

  } catch (error) {
    console.error('Error in cadence archetype:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
