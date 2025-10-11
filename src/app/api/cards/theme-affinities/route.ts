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
        name: 'Sexual Themes',
        correlation: themeData.corr_sexual,
        emoji: '💋',
        description: 'Songs with romantic or sexual content'
      },
      {
        name: 'PG-13 Content',
        correlation: themeData.corr_pg13,
        emoji: '🔞',
        description: 'Songs with mature but not explicit content'
      },
      {
        name: 'Tragic Stories',
        correlation: themeData.corr_tragic,
        emoji: '😢',
        description: 'Songs with sad or tragic narratives'
      },
      {
        name: 'Escapism',
        correlation: themeData.corr_escapism,
        emoji: '🌌',
        description: 'Songs about escaping reality or fantasy'
      },
      {
        name: 'Antihero Themes',
        correlation: themeData.corr_antihero,
        emoji: '🦹',
        description: 'Songs with morally complex protagonists'
      },
      {
        name: 'LGBT Themes',
        correlation: themeData.corr_lgbt,
        emoji: '🏳️‍🌈',
        description: 'Songs with LGBTQ+ themes or content'
      },
      {
        name: 'Substance Abuse',
        correlation: themeData.corr_substance,
        emoji: '🍷',
        description: 'Songs about drugs, alcohol, or addiction'
      },
      {
        name: 'Song Length',
        correlation: themeData.corr_length,
        emoji: '⏱️',
        description: 'Preference for longer or shorter songs'
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
    
    let topAffinities: any[] = []
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
        const highThemeSongs = userReviews.filter(r => r.songs[themeKey] >= 2)
        const lowThemeSongs = userReviews.filter(r => r.songs[themeKey] === 1)
        
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
      
      // Sort by absolute rating difference (strongest preferences first)
      const sortedByDifference = themeDifferences.sort((a, b) => 
        Math.abs(b.rating_difference) - Math.abs(a.rating_difference)
      )
      
      // Get top 3 loves (positive rating differences)
      topAffinities = sortedByDifference
        .filter(theme => theme.rating_difference > 0)
        .slice(0, 3)
      
      // Get top 3 aversions (negative rating differences)
      topAversions = sortedByDifference
        .filter(theme => theme.rating_difference < 0)
        .slice(0, 3)
      
      // If no true aversions found, use the weakest positive preferences as "relative aversions"
      if (topAversions.length === 0) {
        const allPositiveThemes = sortedByDifference.filter(theme => theme.rating_difference > 0)
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

    let themePersonality = 'Balanced Listener'
    let personalityDescription = 'You appreciate a wide variety of musical themes'
    let personalityEmoji = '⚖️'

    // Use rating differences for personality determination
    if (avgPositiveDifference > 0.5) {
      themePersonality = 'Theme Enthusiast'
      personalityDescription = 'You have strong preferences for specific themes'
      personalityEmoji = '🎯'
    } else if (avgNegativeDifference < -0.5) {
      themePersonality = 'Theme Avoider'
      personalityDescription = 'You tend to avoid certain types of content'
      personalityEmoji = '🚫'
    } else if (topAffinities.length === 0 && topAversions.length === 0) {
      themePersonality = 'Open-Minded Listener'
      personalityDescription = 'You enjoy music regardless of its thematic content'
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
  if (abs >= 0.7) return 'Very Strong'
  if (abs >= 0.5) return 'Strong'
  if (abs >= 0.3) return 'Moderate'
  if (abs >= 0.1) return 'Weak'
  return 'Very Weak'
}

function getThemeKey(themeName: string): string | null {
  const themeMap: { [key: string]: string } = {
    'Sexual Themes': 'sexual_themes',
    'PG-13 Content': 'pg13',
    'Tragic Stories': 'tragic_story',
    'Escapism': 'escapism',
    'Antihero Themes': 'antihero',
    'LGBT Themes': 'lgbt',
    'Substance Abuse': 'substance_abuse',
    'Song Length': 'song_length'
  }
  return themeMap[themeName] || null
}
