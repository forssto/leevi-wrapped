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

    // 5. Review streak analysis (20+ songs in 3 hours)
    const sortedReviews = reviews.sort((a, b) => new Date(a.review_time).getTime() - new Date(b.review_time).getTime())
    let streaks = 0
    let i = 0
    
    while (i < sortedReviews.length) {
      // Find the start of a potential streak
      const streakStart = i
      let streakEnd = i
      
      // Look for 20+ consecutive reviews within 3 hours
      for (let j = i; j < sortedReviews.length; j++) {
        const startTime = new Date(sortedReviews[streakStart].review_time).getTime()
        const currentTime = new Date(sortedReviews[j].review_time).getTime()
        const timeDiffHours = (currentTime - startTime) / (1000 * 60 * 60)
        
        if (timeDiffHours <= 3) {
          streakEnd = j
        } else {
          break
        }
      }
      
      // Check if this is a valid streak (20+ songs)
      const songsInStreak = streakEnd - streakStart + 1
      if (songsInStreak >= 20) {
        streaks++
        // Move past this entire streak to avoid overlap
        i = streakEnd + 1
      } else {
        // No valid streak found, move to next review
        i++
      }
    }

    // 6. Determine archetype based on patterns
    let archetype = 'Tasapainottu arvioija'
    let archetypeDescription = 'Arvioit kappaleita tasaisella tahdilla'
    let archetypeEmoji = '⚖️'

    if (avgLag < 1) {
      archetype = 'Aamuvirkku'
      archetypeDescription = 'Arvioit kappaleita melkein heti julkaisun jälkeen'
      archetypeEmoji = '🐦'
    } else if (avgLag > 30) {
      archetype = 'Myöhäinen kukkija'
      archetypeDescription = 'Otat aikaa kappaleiden sulattamiseen ennen arviointia'
      archetypeEmoji = '🌱'
    } else if (reviewsPerDay > 5) {
      archetype = 'Maraton-arvioija'
      archetypeDescription = 'Arvioit monta kappaletta keskittyneissä istunnoissa'
      archetypeEmoji = '🎯'
    } else if (reviewsPerDay < 1) {
      archetype = 'Ajatteleva arvioija'
      archetypeDescription = 'Otat aikaa arvostelujen välillä pohdintaan'
      archetypeEmoji = '🤔'
    }

    // 7. Time preference analysis
    let timePreference = 'Tasapainottu'
    if (mostActiveHour >= 6 && mostActiveHour < 12) {
      timePreference = 'Aamuihminen'
    } else if (mostActiveHour >= 12 && mostActiveHour < 18) {
      timePreference = 'Iltapäivä-innokas'
    } else if (mostActiveHour >= 18 && mostActiveHour < 22) {
      timePreference = 'Ilta-kuuntelija'
    } else {
      timePreference = 'Yökyöpel'
    }

    // 8. Day preference analysis
    const dayNames = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai']
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
      review_streaks: streaks,
      hour_distribution: Object.fromEntries(hourCounts),
      day_distribution: Object.fromEntries(dayCounts)
    })

  } catch (error) {
    console.error('Error in cadence archetype:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
