import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

// Calculate Pearson correlation coefficient
function calculatePearsonCorrelation(userRatings: number[], twinRatings: number[]): number {
  const n = userRatings.length
  if (n === 0) return 0

  const sum1 = userRatings.reduce((sum, rating) => sum + rating, 0)
  const sum2 = twinRatings.reduce((sum, rating) => sum + rating, 0)
  const sum1Sq = userRatings.reduce((sum, rating) => sum + rating * rating, 0)
  const sum2Sq = twinRatings.reduce((sum, rating) => sum + rating * rating, 0)
  const pSum = userRatings.reduce((sum, rating, i) => sum + rating * twinRatings[i], 0)

  const num = pSum - (sum1 * sum2 / n)
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n))

  return den === 0 ? 0 : num / den
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get all reviews with song information
    const { data: allReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        participant_email,
        song_order,
        rating,
        songs(track_name)
      `)

    if (reviewsError) {
      console.error('Error getting reviews:', reviewsError)
      return Response.json({ error: 'Failed to get reviews' }, { status: 500 })
    }

    // Group reviews by user and song
    const userReviews = new Map<string, Map<number, number>>()
    allReviews.forEach(review => {
      const email = review.participant_email
      const songOrder = review.song_order
      const rating = review.rating

      if (!userReviews.has(email)) {
        userReviews.set(email, new Map())
      }
      userReviews.get(email)!.set(songOrder, rating)
    })

    // Get user's reviews
    const userRatingsMap = userReviews.get(userEmail)
    if (!userRatingsMap) {
      return Response.json({ error: 'No reviews found for user' }, { status: 404 })
    }

    console.log(`User ${userEmail} has ${userRatingsMap.size} reviews`)
    console.log(`Total users in database: ${userReviews.size}`)

    // Find songs that both user and potential twin have rated
    const userSongs = Array.from(userRatingsMap.keys())
    
    // Calculate correlation with all other users
    const correlations: Array<{
      email: string
      correlation: number
      overlapCount: number
      alignedHotTakes: Array<{
        song_order: number
        track_name: string
        user_rating: number
        twin_rating: number
        crowd_avg: number
        delta_from_avg: number
      }>
    }> = []

    // Calculate crowd average for each song
    const crowdAverages = new Map<number, number>()
    userSongs.forEach(songOrder => {
      const songRatings = allReviews
        .filter(r => r.song_order === songOrder)
        .map(r => r.rating)
      crowdAverages.set(songOrder, songRatings.reduce((sum, rating) => sum + rating, 0) / songRatings.length)
    })

    // Find correlations with other users
    let potentialTwins = 0
    for (const [email, twinRatingsMap] of userReviews) {
      if (email === userEmail) continue

      // Find overlapping songs
      const overlappingSongs = userSongs.filter(songOrder => twinRatingsMap.has(songOrder))
      
      if (overlappingSongs.length < 5) continue // Require minimum overlap (reduced from 10)
      
      potentialTwins++

      const userRatings = overlappingSongs.map(songOrder => userRatingsMap.get(songOrder)!)
      const twinRatings = overlappingSongs.map(songOrder => twinRatingsMap.get(songOrder)!)

      const correlation = calculatePearsonCorrelation(userRatings, twinRatings)

      // Find aligned hot takes (songs both rated far from crowd in same direction)
      const hotTakes = overlappingSongs
        .map(songOrder => {
          const userRating = userRatingsMap.get(songOrder)!
          const twinRating = twinRatingsMap.get(songOrder)!
          const crowdAvg = crowdAverages.get(songOrder)!
          const userDelta = userRating - crowdAvg
          const twinDelta = twinRating - crowdAvg
          const avgDelta = (userDelta + twinDelta) / 2

          const review = allReviews.find(r => r.song_order === songOrder)
          const trackName = review?.songs ? (review.songs as { track_name: string }).track_name : 'Unknown Song'
          
          return {
            song_order: songOrder,
            track_name: trackName || 'Unknown Song',
            user_rating: userRating,
            twin_rating: twinRating,
            crowd_avg: crowdAvg,
            delta_from_avg: avgDelta
          }
        })
        .filter(take => {
          const userDelta = take.user_rating - take.crowd_avg
          const twinDelta = take.twin_rating - take.crowd_avg
          return userDelta * twinDelta > 0 // Same direction vs crowd
        })
        .sort((a, b) => Math.abs(b.delta_from_avg) - Math.abs(a.delta_from_avg))
        .slice(0, 10)

      correlations.push({
        email,
        correlation,
        overlapCount: overlappingSongs.length,
        alignedHotTakes: hotTakes
      })
    }

    console.log(`Found ${potentialTwins} potential twins with >= 5 overlapping songs`)
    console.log(`Calculated correlations for ${correlations.length} users`)

    // Sort by correlation and overlap count
    correlations.sort((a, b) => {
      if (Math.abs(a.correlation - b.correlation) < 0.01) {
        return b.overlapCount - a.overlapCount
      }
      return b.correlation - a.correlation
    })

    const bestTwin = correlations[0]
    if (!bestTwin) {
      return Response.json({ error: 'No taste twin found' }, { status: 404 })
    }

    // Get twin's name (use email for now, could be pseudonymized)
    const twinName = bestTwin.email.split('@')[0] // Use email prefix as name

    return Response.json({
      twin_name: twinName,
      twin_email: bestTwin.email,
      pearson_r: bestTwin.correlation,
      overlap_count: bestTwin.overlapCount,
      aligned_hot_takes: bestTwin.alignedHotTakes
    })

  } catch (error) {
    console.error('Error in taste twin:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
