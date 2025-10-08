import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get all reviews to calculate crowd averages (in batches to avoid 1000 limit)
    let allReviews: any[] = []
    let from = 0
    const batchSize = 1000
    
    while (true) {
      const { data: batch, error: batchError } = await supabase
        .from('reviews')
        .select('song_order, rating')
        .range(from, from + batchSize - 1)
      
      if (batchError) {
        console.error('Error getting reviews batch:', batchError)
        return Response.json({ error: 'Failed to get reviews' }, { status: 500 })
      }
      
      if (!batch || batch.length === 0) {
        break
      }
      
      allReviews = allReviews.concat(batch)
      from += batchSize
      
      if (batch.length < batchSize) {
        break
      }
    }

    // Get song names separately
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('song_order, track_name')

    if (songsError) {
      console.error('Error getting songs:', songsError)
      return Response.json({ error: 'Failed to get songs' }, { status: 500 })
    }

    // Create a map of song_order to track_name
    const songNames = new Map()
    songs.forEach(song => {
      songNames.set(song.song_order, song.track_name)
    })

    // Calculate crowd average for each song
    const crowdAverages = new Map<number, number>()
    const songInfo = new Map<number, string>()

    allReviews.forEach(review => {
      const songOrder = review.song_order
      const trackName = songNames.get(songOrder)
      if (!trackName) return
      
      if (!crowdAverages.has(songOrder)) {
        crowdAverages.set(songOrder, 0)
        songInfo.set(songOrder, trackName)
      }
    })

    // Calculate averages
    for (const [songOrder] of crowdAverages) {
      const songRatings = allReviews
        .filter(r => r.song_order === songOrder)
        .map(r => r.rating)
      
      const avg = songRatings.reduce((sum, rating) => sum + rating, 0) / songRatings.length
      crowdAverages.set(songOrder, avg)
    }

    // Get user's reviews
    const { data: userReviews, error: userError } = await supabase
      .from('reviews')
      .select(`
        song_order,
        rating,
        songs(track_name)
      `)
      .eq('participant_email', userEmail)

    if (userError) {
      console.error('Error getting user reviews:', userError)
      return Response.json({ error: 'Failed to get user reviews' }, { status: 500 })
    }

    if (!userReviews || userReviews.length === 0) {
      return Response.json({ error: 'No reviews found for user' }, { status: 404 })
    }

    // Calculate hot take index and deltas
    const deltas = userReviews.map(review => {
      const crowdAvg = crowdAverages.get(review.song_order) || 0
      const delta = review.rating - crowdAvg
      const absDelta = Math.abs(delta)

      return {
        song_order: review.song_order,
        track_name: songNames.get(review.song_order) || 'Unknown',
        user_rating: review.rating,
        crowd_avg: crowdAvg,
        delta: delta,
        abs_delta: absDelta
      }
    })

    // Calculate hot take index (average absolute delta)
    const hotTakeIndex = deltas.reduce((sum, d) => sum + d.abs_delta, 0) / deltas.length

    // Get top 5 hot takes (largest absolute deltas)
    const topHotTakes = deltas
      .sort((a, b) => b.abs_delta - a.abs_delta)
      .slice(0, 5)

    // Calculate percentile rank among all users
    const { data: allUserReviews, error: allUserError } = await supabase
      .from('reviews')
      .select('participant_email, song_order, rating')

    if (allUserError) {
      console.error('Error getting all user reviews:', allUserError)
      return Response.json({ error: 'Failed to get all user reviews' }, { status: 500 })
    }

    // Calculate hot take index for all users
    const userHotTakeIndices = new Map<string, number>()
    const userReviewsMap = new Map<string, Array<{song_order: number, rating: number}>>()

    allUserReviews.forEach(review => {
      const email = review.participant_email
      if (!userReviewsMap.has(email)) {
        userReviewsMap.set(email, [])
      }
      userReviewsMap.get(email)!.push({
        song_order: review.song_order,
        rating: review.rating
      })
    })

    // Calculate hot take index for each user
    for (const [email, reviews] of userReviewsMap) {
      const userDeltas = reviews.map(review => {
        const crowdAvg = crowdAverages.get(review.song_order) || 0
        return Math.abs(review.rating - crowdAvg)
      })
      
      const userHTI = userDeltas.reduce((sum, delta) => sum + delta, 0) / userDeltas.length
      userHotTakeIndices.set(email, userHTI)
    }

    // Calculate percentile rank
    const allHTIs = Array.from(userHotTakeIndices.values())
    const usersBelow = allHTIs.filter(hti => hti < hotTakeIndex).length
    const rankPercentile = (usersBelow / allHTIs.length) * 100

    return Response.json({
      hot_take_index: hotTakeIndex,
      rank_percentile: rankPercentile,
      top_hot_takes: topHotTakes
    })

  } catch (error) {
    console.error('Error in hot take index:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
