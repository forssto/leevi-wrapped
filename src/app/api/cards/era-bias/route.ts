import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user's reviews with song year information
    const { data: userReviews, error: userError } = await supabase
      .from('reviews')
      .select(`
        rating,
        songs!inner(year)
      `)
      .eq('participant_email', userEmail)

    if (userError) {
      console.error('Error getting user reviews:', userError)
      return Response.json({ error: 'Failed to get user reviews' }, { status: 500 })
    }

    if (!userReviews || userReviews.length === 0) {
      return Response.json({ error: 'No reviews found for user' }, { status: 404 })
    }

    // Group ratings by decade
    const decadeRatings = new Map<number, number[]>()
    
    userReviews.forEach(review => {
      const year = (review.songs as { year: number }[])[0]?.year
      if (!year) return
      const decade = Math.floor(year / 10) * 10
      
      if (!decadeRatings.has(decade)) {
        decadeRatings.set(decade, [])
      }
      decadeRatings.get(decade)!.push(review.rating)
    })

    // Calculate average rating per decade
    const decadeStats = Array.from(decadeRatings.entries()).map(([decade, ratings]) => ({
      decade,
      avg_rating: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      review_count: ratings.length
    })).sort((a, b) => a.decade - b.decade)

    // Find best and worst decades
    const bestDecade = decadeStats.reduce((max, stat) => 
      stat.avg_rating > max.avg_rating ? stat : max
    )
    const worstDecade = decadeStats.reduce((min, stat) => 
      stat.avg_rating < min.avg_rating ? stat : min
    )

    // Calculate trend (linear regression slope)
    const n = decadeStats.length
    if (n > 1) {
      const sumX = decadeStats.reduce((sum, stat) => sum + stat.decade, 0)
      const sumY = decadeStats.reduce((sum, stat) => sum + stat.avg_rating, 0)
      const sumXY = decadeStats.reduce((sum, stat) => sum + stat.decade * stat.avg_rating, 0)
      const sumXX = decadeStats.reduce((sum, stat) => sum + stat.decade * stat.decade, 0)
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      
      return Response.json({
        decade_ratings: decadeStats,
        best_decade: bestDecade.decade,
        worst_decade: worstDecade.decade,
        trend_slope: slope,
        trend_direction: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable'
      })
    }

    return Response.json({
      decade_ratings: decadeStats,
      best_decade: bestDecade.decade,
      worst_decade: worstDecade.decade,
      trend_slope: 0,
      trend_direction: 'stable'
    })

  } catch (error) {
    console.error('Error in era bias:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
