import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Get user's overall stats
    const { data: userStats, error: userStatsError } = await supabase
      .from('mv_user_avg')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (userStatsError) {
      console.error('Error getting user stats:', userStatsError)
      return Response.json({ error: 'Failed to get user stats' }, { status: 500 })
    }

    if (!userStats) {
      return Response.json({ error: 'No user stats found' }, { status: 404 })
    }

    // Get user's theme correlations
    const { data: themeStats, error: themeStatsError } = await supabase
      .from('mv_user_theme_stats')
      .select('*')
      .eq('email', userEmail)
      .single()

    // Get user's popularity correlation
    const { data: popularityStats, error: popularityStatsError } = await supabase
      .from('mv_user_popularity_stats')
      .select('*')
      .eq('email', userEmail)
      .single()

    // Get user's era preferences
    const { data: eraStats, error: eraStatsError } = await supabase
      .from('mv_user_era_stats')
      .select('*')
      .eq('email', userEmail)

    // Calculate prediction factors
    const factors = []

    // 1. Overall average (baseline predictor)
    factors.push({
      name: 'Your Average Rating',
      weight: 0.4,
      value: userStats.user_avg,
      description: 'Your typical rating level',
      emoji: '📊'
    })

    // 2. Theme correlations (if available)
    if (themeStats && !themeStatsError) {
      const strongestTheme = Math.max(
        Math.abs(themeStats.corr_sexual || 0),
        Math.abs(themeStats.corr_tragic || 0),
        Math.abs(themeStats.corr_escapism || 0),
        Math.abs(themeStats.corr_antihero || 0),
        Math.abs(themeStats.corr_lgbt || 0),
        Math.abs(themeStats.corr_substance || 0)
      )
      
      if (strongestTheme > 0.2) {
        factors.push({
          name: 'Theme Preferences',
          weight: 0.2,
          value: strongestTheme,
          description: 'How much themes influence your ratings',
          emoji: '🎭'
        })
      }
    }

    // 3. Popularity correlation (if available)
    if (popularityStats && !popularityStatsError && Math.abs(popularityStats.corr_popularity) > 0.1) {
      factors.push({
        name: 'Popularity Bias',
        weight: 0.15,
        value: Math.abs(popularityStats.corr_popularity),
        description: 'How much popularity affects your ratings',
        emoji: '📻'
      })
    }

    // 4. Era preferences (if available)
    if (eraStats && !eraStatsError && eraStats.length > 0) {
      const eraVariance = calculateVariance(eraStats.map(e => e.decade_avg))
      if (eraVariance > 0.5) {
        factors.push({
          name: 'Era Preferences',
          weight: 0.15,
          value: Math.min(eraVariance / 2, 1),
          description: 'How much era affects your ratings',
          emoji: '📅'
        })
      }
    }

    // 5. Rating consistency
    const consistency = userStats.rating_stddev ? Math.max(0, 1 - (userStats.rating_stddev / 3)) : 0.5
    factors.push({
      name: 'Rating Consistency',
      weight: 0.1,
      value: consistency,
      description: 'How consistent your ratings are',
      emoji: '🎯'
    })

    // Calculate overall predictability
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0)
    const weightedScore = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0)
    const predictability = totalWeight > 0 ? weightedScore / totalWeight : 0.5

    // Determine prediction grade
    let grade = 'C'
    let gradeDescription = 'Moderately Predictable'
    let gradeEmoji = '📝'
    let gradeColor = 'text-yellow-400'

    if (predictability >= 0.8) {
      grade = 'A+'
      gradeDescription = 'Highly Predictable'
      gradeEmoji = '🎯'
      gradeColor = 'text-green-400'
    } else if (predictability >= 0.7) {
      grade = 'A'
      gradeDescription = 'Very Predictable'
      gradeEmoji = '📊'
      gradeColor = 'text-green-300'
    } else if (predictability >= 0.6) {
      grade = 'B'
      gradeDescription = 'Fairly Predictable'
      gradeEmoji = '📈'
      gradeColor = 'text-blue-400'
    } else if (predictability >= 0.4) {
      grade = 'C'
      gradeDescription = 'Moderately Predictable'
      gradeEmoji = '📝'
      gradeColor = 'text-yellow-400'
    } else {
      grade = 'D'
      gradeDescription = 'Unpredictable'
      gradeEmoji = '🎲'
      gradeColor = 'text-red-400'
    }

    // Generate insights
    const insights = []
    
    if (userStats.rating_stddev < 1) {
      insights.push('You have very consistent rating patterns')
    } else if (userStats.rating_stddev > 2) {
      insights.push('Your ratings vary quite a bit - you\'re hard to predict!')
    }

    if (themeStats && Math.abs(themeStats.corr_sexual || 0) > 0.3) {
      insights.push('Your ratings are strongly influenced by song themes')
    }

    if (popularityStats && Math.abs(popularityStats.corr_popularity) > 0.3) {
      insights.push('Song popularity significantly affects your ratings')
    }

    if (eraStats && eraStats.length > 1) {
      const eraRange = Math.max(...eraStats.map(e => e.decade_avg)) - Math.min(...eraStats.map(e => e.decade_avg))
      if (eraRange > 1) {
        insights.push('You have strong preferences for certain musical eras')
      }
    }

    if (insights.length === 0) {
      insights.push('Your taste is quite balanced across different factors')
    }

    return Response.json({
      grade,
      grade_description: gradeDescription,
      grade_emoji: gradeEmoji,
      grade_color: gradeColor,
      predictability_score: predictability,
      user_avg_rating: userStats.user_avg,
      rating_consistency: userStats.rating_stddev,
      prediction_factors: factors,
      insights,
      report_summary: `Your musical taste is ${gradeDescription.toLowerCase()}.`
    })

  } catch (error) {
    console.error('Error in prediction report:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return variance
}
