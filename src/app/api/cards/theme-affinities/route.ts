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

    // Get top 3 strongest affinities (positive correlations)
    const topAffinities = validThemes
      .filter(theme => theme.correlation > 0)
      .slice(0, 3)

    // Get top 3 strongest aversions (negative correlations)
    const topAversions = validThemes
      .filter(theme => theme.correlation < 0)
      .slice(0, 3)

    // Determine overall theme personality
    const avgPositiveCorrelation = topAffinities.length > 0 
      ? topAffinities.reduce((sum, theme) => sum + theme.correlation, 0) / topAffinities.length 
      : 0

    const avgNegativeCorrelation = topAversions.length > 0 
      ? topAversions.reduce((sum, theme) => sum + theme.correlation, 0) / topAversions.length 
      : 0

    let themePersonality = 'Balanced Listener'
    let personalityDescription = 'You appreciate a wide variety of musical themes'
    let personalityEmoji = '⚖️'

    if (avgPositiveCorrelation > 0.3) {
      themePersonality = 'Theme Enthusiast'
      personalityDescription = 'You have strong preferences for specific themes'
      personalityEmoji = '🎯'
    } else if (avgNegativeCorrelation < -0.3) {
      themePersonality = 'Theme Avoider'
      personalityDescription = 'You tend to avoid certain types of content'
      personalityEmoji = '🚫'
    } else if (Math.abs(avgPositiveCorrelation) < 0.1 && Math.abs(avgNegativeCorrelation) < 0.1) {
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
      avg_positive_correlation: avgPositiveCorrelation,
      avg_negative_correlation: avgNegativeCorrelation
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
