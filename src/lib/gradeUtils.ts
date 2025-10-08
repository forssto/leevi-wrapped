/**
 * Utility functions for Finnish school grade formatting
 */

/**
 * Convert a decimal rating to Finnish school grade notation
 * @param rating - The decimal rating (e.g., 4.25, 5.75)
 * @returns Finnish school grade string (e.g., "4+", "5-")
 */
export function toFinnishGrade(rating: number): string {
  const whole = Math.floor(rating)
  const decimal = rating - whole
  
  if (decimal === 0) {
    return whole.toString()
  } else if (decimal <= 0.25) {
    return `${whole}+`
  } else if (decimal <= 0.5) {
    return `${whole},5`
  } else if (decimal <= 0.75) {
    return `${whole + 1}-`
  } else {
    return (whole + 1).toString()
  }
}

/**
 * Format a number with Finnish locale (comma as decimal separator)
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatFinnishNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('fi-FI', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format a rating for display - use Finnish grade for individual ratings, 
 * Finnish number format for averages/aggregates
 * @param rating - The rating to format
 * @param isIndividual - Whether this is an individual rating (use grade) or aggregate (use number)
 * @returns Formatted rating string
 */
export function formatRating(rating: number, isIndividual: boolean = false): string {
  if (isIndividual) {
    return toFinnishGrade(rating)
  } else {
    return formatFinnishNumber(rating, 2)
  }
}
