import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAlbumCover } from '@/lib/albumCovers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get album preferences using the SQL function
    const { data: albumData, error: albumError } = await supabase
      .rpc('get_album_preferences', { user_email: userEmail })

    console.log('Album preferences result:', { albumData, albumError })

    if (albumError) {
      console.error('Error getting album preferences:', albumError)
      return Response.json({ error: 'Failed to get album preferences' }, { status: 500 })
    }

    if (!albumData || albumData.length === 0) {
      return Response.json({ error: 'No album data found' }, { status: 404 })
    }

    const result = albumData[0]

    // Get all album rankings for this user (excluding "Single")
    const { data: allAlbums, error: allAlbumsError } = await supabase
      .from('mv_user_album_avg')
      .select('album, album_avg')
      .eq('email', userEmail)
      .neq('album', 'Single')
      .order('album_avg', { ascending: false })

    if (allAlbumsError) {
      console.error('Error getting all albums:', allAlbumsError)
    }

    // Get crowd averages for all albums by calculating them directly
    const { data: crowdAlbums, error: crowdAlbumsError } = await supabase
      .from('reviews')
      .select(`
        rating,
        songs!inner(album)
      `)
      .not('songs.album', 'is', null)
      .neq('songs.album', 'Single')

    if (crowdAlbumsError) {
      console.error('Error getting crowd album averages:', crowdAlbumsError)
    }

    // Calculate crowd averages for each album
    const crowdAvgMap = new Map()
    if (crowdAlbums) {
      const albumRatings = new Map()
      
      // Group ratings by album
      crowdAlbums.forEach(review => {
        const album = (review.songs as unknown as { album: string }).album
        if (!albumRatings.has(album)) {
          albumRatings.set(album, [])
        }
        albumRatings.get(album).push(review.rating)
      })
      
      // Calculate averages
      albumRatings.forEach((ratings, album) => {
        const avg = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
        crowdAvgMap.set(album, avg)
      })
    }

    const albumRankings = allAlbums?.map(album => ({
      album: album.album,
      avg_rating: parseFloat(album.album_avg),
      crowd_avg: crowdAvgMap.get(album.album) || 0,
      cover: getAlbumCover(album.album)
    })) || []

    return Response.json({
      fav_album: result.fav_album,
      fav_album_user_avg: parseFloat(result.fav_album_user_avg),
      users_who_liked_fav_more: result.users_who_liked_fav_more,
      fav_album_cover: getAlbumCover(result.fav_album),
      worst_album: result.worst_album,
      worst_album_user_avg: parseFloat(result.worst_album_user_avg),
      users_who_liked_worst_less: result.users_who_liked_worst_less,
      worst_album_cover: getAlbumCover(result.worst_album),
      album_rankings: albumRankings
    })

  } catch (error) {
    console.error('Error in album preferences:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
