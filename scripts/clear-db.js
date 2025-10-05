const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function clearDatabase() {
  try {
    console.log('Clearing database...')
    
    // Delete in reverse order of dependencies
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .neq('song_order', 0) // Delete all rows
    
    if (reviewsError) {
      console.error('Error clearing reviews:', reviewsError)
    } else {
      console.log('Cleared reviews table')
    }
    
    const { error: participantsError } = await supabase
      .from('participants')
      .delete()
      .neq('email', '') // Delete all rows
    
    if (participantsError) {
      console.error('Error clearing participants:', participantsError)
    } else {
      console.log('Cleared participants table')
    }
    
    const { error: songsError } = await supabase
      .from('songs')
      .delete()
      .neq('song_order', 0) // Delete all rows
    
    if (songsError) {
      console.error('Error clearing songs:', songsError)
    } else {
      console.log('Cleared songs table')
    }
    
    console.log('Database cleared successfully!')
    
  } catch (error) {
    console.error('Error clearing database:', error)
    process.exit(1)
  }
}

clearDatabase()
