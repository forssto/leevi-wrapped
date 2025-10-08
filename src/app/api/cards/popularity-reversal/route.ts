import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ReviewWithSong {
  song_order: number
  rating: number
  songs: {
    track_name: string
    album: string
    year: number
    lastfm_pos: number
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user's popularity correlation data
    const { data: popularityData, error: popularityError } = await supabase
      .from('mv_user_popularity_stats')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (popularityError) {
      console.error('Error getting popularity data:', popularityError)
      return Response.json({ error: 'Failed to get popularity data' }, { status: 500 })
    }

    if (!popularityData) {
      return Response.json({ error: 'No popularity data found for user' }, { status: 404 })
    }

    const correlation = popularityData.corr_popularity
    const songsWithLastfm = popularityData.songs_with_lastfm

    // Determine popularity personality based on correlation
    let personality = 'Balanced Listener'
    let personalityDescription = 'You enjoy both popular and obscure songs equally'
    let personalityEmoji = '⚖️'
    let personalityColor = 'text-gray-400'

    if (correlation > 0.3) {
      personality = 'Mainstream Lover'
      personalityDescription = 'You tend to prefer songs that are more popular'
      personalityEmoji = '📻'
      personalityColor = 'text-blue-400'
    } else if (correlation > 0.1) {
      personality = 'Popularity Appreciator'
      personalityDescription = 'You slightly favor more popular songs'
      personalityEmoji = '🎵'
      personalityColor = 'text-blue-300'
    } else if (correlation < -0.3) {
      personality = 'Underground Explorer'
      personalityDescription = 'You prefer less popular, more obscure songs'
      personalityEmoji = '🔍'
      personalityColor = 'text-purple-400'
    } else if (correlation < -0.1) {
      personality = 'Indie Enthusiast'
      personalityDescription = 'You tend to favor less mainstream music'
      personalityEmoji = '🎧'
      personalityColor = 'text-purple-300'
    }

    // Get specific examples of popular vs unpopular songs the user rated
    const { data: userReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        song_order,
        rating,
        songs!inner(
          track_name,
          album,
          year,
          lastfm_pos
        )
      `)
      .eq('participant_email', userEmail)
      .not('songs.lastfm_pos', 'is', null)
      .order('songs.lastfm_pos', { ascending: true })

    if (reviewsError) {
      console.error('Error getting user reviews:', reviewsError)
    }

    // Find examples of popular and unpopular songs
    let popularExamples: Array<{
      track_name: string
      album: string
      year: number
      lastfm_pos: number
      user_rating: number
    }> = []
    
    let unpopularExamples: Array<{
      track_name: string
      album: string
      year: number
      lastfm_pos: number
      user_rating: number
    }> = []

    if (userReviews && userReviews.length > 0) {
      // Sort by Last.fm position (lower = more popular)
      const sortedReviews = userReviews
        .map((review: ReviewWithSong) => ({
          track_name: review.songs[0].track_name,
          album: review.songs[0].album,
          year: review.songs[0].year,
          lastfm_pos: review.songs[0].lastfm_pos,
          user_rating: review.rating
        }))
        .sort((a, b) => a.lastfm_pos - b.lastfm_pos)

      // Get top 3 most popular songs (lowest lastfm_pos)
      popularExamples = sortedReviews.slice(0, 3)

      // Get top 3 least popular songs (highest lastfm_pos)
      unpopularExamples = sortedReviews.slice(-3).reverse()
    }

    // Calculate some additional stats
    const correlationStrength = getCorrelationStrength(correlation)
    const isMainstream = correlation > 0.1
    const isUnderground = correlation < -0.1

    return Response.json({
      personality,
      personality_description: personalityDescription,
      personality_emoji: personalityEmoji,
      personality_color: personalityColor,
      correlation,
      correlation_strength: correlationStrength,
      songs_with_lastfm: songsWithLastfm,
      is_mainstream: isMainstream,
      is_underground: isUnderground,
      popular_examples: popularExamples,
      unpopular_examples: unpopularExamples
    })

  } catch (error) {
    console.error('Error in popularity reversal:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getCorrelationStrength(correlation: number): string {
  const abs = Math.abs(correlation)
  if (abs >= 0.7) return 'Very Strong'
  if (abs >= 0.5) return 'Strong'
  if (abs >= 0.3) return 'Moderate'
  if (abs >= 0.1) return 'Weak'
  return 'Very Weak'
}
