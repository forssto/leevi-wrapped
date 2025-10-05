const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function importSongs() {
  console.log('Importing songs...')
  const rows = []
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('./data/songs.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Convert data types
        Object.keys(row).forEach(key => {
          const value = row[key]
          if (value === 'true') row[key] = true
          if (value === 'false') row[key] = false
          if (!isNaN(value) && value !== '' && value !== 'true' && value !== 'false') {
            row[key] = parseFloat(value)
          }
          if (value === '') row[key] = null
        })
        
        // Filter to only allowed columns
        const allowedColumns = ['song_order', 'track_name', 'album', 'year', 'nrgm_list', 'date', 'song_length', 'instrumental', 'lyrics', 'analysis', 'main_lines', 'tags_adjective', 'tags_noun', 'sexual_themes', 'pg13', 'cancel_target', 'tragic_story', 'escapism', 'antihero', 'lgbt', 'substance_abuse', 'lastfm_sum', 'lastfm_pos']
        const filteredRow = {}
        allowedColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col]
          }
        })
        
        rows.push(filteredRow)
      })
      .on('end', async () => {
        try {
          const { error } = await supabase.from('songs').insert(rows)
          if (error) throw error
          console.log(`Successfully imported ${rows.length} songs`)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
      .on('error', reject)
  })
}

async function importParticipants() {
  console.log('Importing participants (only those with done = true)...')
  const rows = []
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('./data/participants.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Convert data types
        Object.keys(row).forEach(key => {
          const value = row[key]
          if (value === 'true') row[key] = true
          if (value === 'false') row[key] = false
          if (!isNaN(value) && value !== '' && value !== 'true' && value !== 'false') {
            row[key] = parseFloat(value)
          }
          if (value === '') row[key] = null
        })
        
        // Only include participants with done = true
        // Check both boolean true and string 'TRUE'
        if (row.done !== true && row.done !== 'TRUE') {
          return // Skip this row
        }
        
        // Debug: log first few participants
        if (rows.length < 3) {
          console.log(`Participant ${rows.length + 1}: ${row.email}, done: ${row.done} (type: ${typeof row.done})`)
        }
        
        // Filter to only allowed columns
        const allowedColumns = ['created', 'email', 'name', 'gender', 'decade', 'urban_rural', 'city', 'artist_relationship', 'winner_prediction', 'hate_song', 'explicit_lyrics_relationship', 'music_relationship', 'works_in_music', 'plays_music', 'format', 'project_endurance', 'participation_frequency', 'google_group', 'nrgm', 'done', 'aft_nps', 'aft_artist_relationship', 'aft_winner_prediction', 'aft_hate_song', 'aft_explicit_lyrics_relationship', 'aft_reviewed_as_expected', 'aft_influenced_by_others']
        const filteredRow = {}
        allowedColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col]
          }
        })
        
        rows.push(filteredRow)
      })
      .on('end', async () => {
        try {
          const { error } = await supabase.from('participants').insert(rows)
          if (error) throw error
          console.log(`Successfully imported ${rows.length} participants`)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
      .on('error', reject)
  })
}

async function importReviews() {
  console.log('Importing reviews (only for valid participants)...')
  
  // First, get all valid participant emails
  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('email')
  
  if (participantsError) {
    throw participantsError
  }
  
  const validEmails = new Set(participants.map(p => p.email))
  console.log(`Found ${validEmails.size} valid participants`)
  
  const rows = []
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('./data/reviews.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Only process reviews for valid participants
        if (!validEmails.has(row.participant_email)) {
          return // Skip this row
        }
        
        // Convert data types
        Object.keys(row).forEach(key => {
          const value = row[key]
          if (value === 'true') row[key] = true
          if (value === 'false') row[key] = false
          if (!isNaN(value) && value !== '' && value !== 'true' && value !== 'false') {
            row[key] = parseFloat(value)
          }
          if (value === '') row[key] = null
        })
        
        // Special handling for ratings
        if (row.rating && typeof row.rating === 'number') {
          if (row.rating % 1 === 0) {
            row.rating = parseFloat(row.rating.toFixed(2))
          }
        }
        
        // Filter to only allowed columns
        const allowedColumns = ['song_order', 'song_title', 'participant_email', 'rating', 'time']
        const filteredRow = {}
        allowedColumns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col]
          }
        })
        
        rows.push(filteredRow)
      })
      .on('end', async () => {
        try {
          const { error } = await supabase.from('reviews').insert(rows)
          if (error) throw error
          console.log(`Successfully imported ${rows.length} reviews`)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
      .on('error', reject)
  })
}

async function main() {
  try {
    console.log('Starting clean data import...')
    
    // Test connection
    const { data, error } = await supabase.from('songs').select('count').limit(1)
    if (error) {
      console.error('Database connection failed:', error)
      process.exit(1)
    }
    console.log('Connection successful!')
    
    // Import in order
    await importSongs()
    await importParticipants()
    await importReviews()
    
    console.log('All data imported successfully!')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
