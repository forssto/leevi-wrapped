import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user's theme correlation data
    const { data: themeData, error: themeError } = await supabase
      .from('mv_user_theme_stats')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (themeError) {
      console.error('Error getting theme data:', themeError)
      return Response.json({ error: 'Failed to get theme data' }, { status: 500 })
    }

    if (!themeData) {
      return Response.json({ error: 'No theme data found for user' }, { status: 404 })
    }

    // Define theme categories with their correlations
    const themes = [
      {
        name: 'Seksuaalisuus',
        correlation: themeData.corr_sexual,
        emoji: '💋',
        description: 'Kappaleita romanttisella tai seksuaalisella sisällöllä'
      },
      {
        name: 'K-18 sisältö',
        correlation: themeData.corr_pg13,
        emoji: '🔞',
        description: 'Kappaleita kypsällä mutta ei eksplisiittisellä sisällöllä'
      },
      {
        name: 'Traagisuus',
        correlation: themeData.corr_tragic,
        emoji: '😢',
        description: 'Kappaleita surullisilla tai traagisilla tarinoilla'
      },
      {
        name: 'Eskapismi ja nostalgia',
        correlation: themeData.corr_escapism,
        emoji: '🌌',
        description: 'Kappaleita todellisuudesta pakenemisesta tai fantasiasta'
      },
      {
        name: 'Antisankari',
        correlation: themeData.corr_antihero,
        emoji: '🦹',
        description: 'Kappaleita moraalisesti monimutkaisilla päähenkilöillä'
      },
      {
        name: 'Sukupuolivähemmistöt',
        correlation: themeData.corr_lgbt,
        emoji: '🏳️‍🌈',
        description: 'Kappaleita LGBTQ+ teemoilla tai sisällöllä'
      },
      {
        name: 'Päihteiteet',
        correlation: themeData.corr_substance,
        emoji: '🍷',
        description: 'Kappaleita huumeista, alkoholista tai riippuvuudesta'
      },
      {
        name: 'Kappaleen pituus',
        correlation: themeData.corr_length,
        emoji: '⏱️',
        description: 'Mieltymys pidempiin tai lyhyempiin kappaleisiin'
      }
    ]

    // Filter out null correlations and sort by absolute correlation strength
    const validThemes = themes
      .filter(theme => theme.correlation !== null)
      .map(theme => ({
        ...theme,
        abs_correlation: Math.abs(theme.correlation),
        strength: getCorrelationStrength(theme.correlation)
      }))
      .sort((a, b) => b.abs_correlation - a.abs_correlation)

    // Calculate theme preferences based on how much the user's ratings differ from their average
    // when that theme is present vs absent. This gives us true loves/aversions.
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topAffinities: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topAversions: any[] = []
    
    // Get user's reviews with theme data to calculate actual rating differences
    const { data: userReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        rating,
        songs!inner(
          sexual_themes, pg13, tragic_story, escapism, 
          antihero, lgbt, substance_abuse, song_length
        )
      `)
      .eq('participant_email', userEmail)

    if (reviewsError || !userReviews) {
      console.error('Error getting user reviews:', reviewsError)
      // Fallback to correlation-based approach
      const sortedByStrength = [...validThemes].sort((a, b) => b.abs_correlation - a.abs_correlation)
      topAffinities = sortedByStrength.filter(theme => theme.correlation > 0).slice(0, 3)
      topAversions = sortedByStrength.filter(theme => theme.correlation < 0).slice(0, 3)
    } else {
      // Calculate actual rating differences for each theme
      const userAvgRating = themeData.user_avg_rating
      const themeDifferences = themes.map(theme => {
        const themeKey = getThemeKey(theme.name)
        if (!themeKey) return { ...theme, rating_difference: 0 }
        
        // Calculate average rating when theme is high (2-3) vs low (1)
        const highThemeSongs = userReviews.filter(r => (r.songs as unknown as Record<string, number>)[themeKey] >= 2)
        const lowThemeSongs = userReviews.filter(r => (r.songs as unknown as Record<string, number>)[themeKey] === 1)
        
        const highThemeAvg = highThemeSongs.length > 0 
          ? highThemeSongs.reduce((sum, r) => sum + r.rating, 0) / highThemeSongs.length 
          : userAvgRating
        const lowThemeAvg = lowThemeSongs.length > 0 
          ? lowThemeSongs.reduce((sum, r) => sum + r.rating, 0) / lowThemeSongs.length 
          : userAvgRating
        
        const ratingDifference = highThemeAvg - lowThemeAvg
        
        return {
          ...theme,
          rating_difference: ratingDifference,
          high_theme_avg: highThemeAvg,
          low_theme_avg: lowThemeAvg,
          high_theme_count: highThemeSongs.length,
          low_theme_count: lowThemeSongs.length
        }
      }).filter(theme => theme.rating_difference !== 0)
      
      // Get top 3 loves (positive rating differences) - sorted by highest first
      topAffinities = themeDifferences
        .filter(theme => theme.rating_difference > 0)
        .sort((a, b) => b.rating_difference - a.rating_difference)
        .slice(0, 3)
      
      // Get top 3 aversions (negative rating differences) - sorted by most negative first
      topAversions = themeDifferences
        .filter(theme => theme.rating_difference < 0)
        .sort((a, b) => a.rating_difference - b.rating_difference)
        .slice(0, 3)
      
      // If no true aversions found, use the weakest positive preferences as "relative aversions"
      if (topAversions.length === 0) {
        const allPositiveThemes = themeDifferences.filter(theme => theme.rating_difference > 0)
        topAversions = allPositiveThemes
          .sort((a, b) => a.rating_difference - b.rating_difference) // Sort by weakest first
          .slice(0, 3)
          .map(theme => ({
            ...theme,
            is_relative_aversion: true // Flag to indicate this is a relative aversion
          }))
      }
    }

    // Determine overall theme personality based on rating differences
    const avgPositiveDifference = topAffinities.length > 0 
      ? topAffinities.reduce((sum, theme) => sum + (theme.rating_difference || theme.correlation), 0) / topAffinities.length 
      : 0

    const avgNegativeDifference = topAversions.length > 0 
      ? topAversions.reduce((sum, theme) => sum + (theme.rating_difference || theme.correlation), 0) / topAversions.length 
      : 0

    let themePersonality = 'Tasapainottu kuuntelija'
    let personalityDescription = 'Arvostat laajaa musiikkiteemojen kirjoa'
    let personalityEmoji = '⚖️'

    // Use rating differences for personality determination
    if (avgPositiveDifference > 0.5) {
      themePersonality = 'Teema-innokas'
      personalityDescription = 'Sinulla on vahvat mieltymykset tiettyihin teemoihin'
      personalityEmoji = '🎯'
    } else if (avgNegativeDifference < -0.5) {
      themePersonality = 'Teema-välttäjä'
      personalityDescription = 'Välttäät tiettyjä sisältötyyppejä'
      personalityEmoji = '🚫'
    } else if (topAffinities.length === 0 && topAversions.length === 0) {
      themePersonality = 'Avoinmielinen kuuntelija'
      personalityDescription = 'Nautit musiikista riippumatta sen teemallisesta sisällöstä'
      personalityEmoji = '🌈'
    }

    return Response.json({
      theme_personality: themePersonality,
      personality_description: personalityDescription,
      personality_emoji: personalityEmoji,
      user_avg_rating: themeData.user_avg_rating,
      top_affinities: topAffinities,
      top_aversions: topAversions,
      all_themes: validThemes,
      avg_positive_difference: avgPositiveDifference,
      avg_negative_difference: avgNegativeDifference,
      // Debug info
      method: reviewsError ? 'correlation_fallback' : 'rating_difference'
    })

  } catch (error) {
    console.error('Error in theme affinities:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getCorrelationStrength(correlation: number): string {
  const abs = Math.abs(correlation)
  if (abs >= 0.2) return 'Todella vahva'
  if (abs >= 0.15) return 'Vahva'
  if (abs >= 0.1) return 'Keskimääräinen'
  if (abs >= 0.5) return 'Heikko'
  return 'Todella heikko'
}

function getThemeKey(themeName: string): string | null {
  const themeMap: { [key: string]: string } = {
    'Seksuaalisuus': 'sexual_themes',
    'K-18 sisältö': 'pg13',
    'Traagisuus': 'tragic_story',
    'Eskapismi ja nostalgia': 'escapism',
    'Antisankari': 'antihero',
    'Sukupuolivähemmistöt': 'lgbt',
    'Päihteiteet': 'substance_abuse',
    'Kappaleen pituus': 'song_length'
  }
  return themeMap[themeName] || null
}
