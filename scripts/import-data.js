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

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Role Key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))

async function importCSV(tableName, csvFilePath) {
  console.log(`Importing ${tableName} from ${csvFilePath}...`)
  
  const rows = []
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Convert string values to appropriate types
        Object.keys(row).forEach(key => {
          const value = row[key]
          
          // Convert boolean strings
          if (value === 'true') row[key] = true
          if (value === 'false') row[key] = false
          
          // Convert numeric strings
          if (!isNaN(value) && value !== '' && value !== 'true' && value !== 'false') {
            row[key] = parseFloat(value)
          }
          
          // Special handling for ratings - convert integers to proper decimal format
          if (key === 'rating' && typeof row[key] === 'number') {
            // If rating is an integer like 9, convert to 9.00
            if (row[key] % 1 === 0) {
              row[key] = parseFloat(row[key].toFixed(2))
            }
          }
          
          // Convert empty strings to null
          if (value === '') row[key] = null
        })
        
        // Remove columns that don't exist in the database schema
        const allowedColumns = {
          'songs': ['song_order', 'track_name', 'album', 'year', 'nrgm_list', 'date', 'song_length', 'instrumental', 'lyrics', 'analysis', 'main_lines', 'tags_adjective', 'tags_noun', 'sexual_themes', 'pg13', 'cancel_target', 'tragic_story', 'escapism', 'antihero', 'lgbt', 'substance_abuse', 'lastfm_sum', 'lastfm_pos'],
          'participants': ['created', 'email', 'name', 'gender', 'decade', 'urban_rural', 'city', 'artist_relationship', 'winner_prediction', 'hate_song', 'explicit_lyrics_relationship', 'music_relationship', 'works_in_music', 'plays_music', 'format', 'project_endurance', 'participation_frequency', 'google_group', 'nrgm', 'done', 'aft_nps', 'aft_artist_relationship', 'aft_winner_prediction', 'aft_hate_song', 'aft_explicit_lyrics_relationship', 'aft_reviewed_as_expected', 'aft_influenced_by_others'],
          'reviews': ['song_order', 'song_title', 'participant_email', 'rating', 'time']
        }
        
        // Filter out columns that don't exist in the schema
        const filteredRow = {}
        allowedColumns[tableName]?.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col]
          }
        })
        
        // Replace the original row with filtered row
        Object.keys(row).forEach(key => delete row[key])
        Object.assign(row, filteredRow)
        
        rows.push(row)
      })
      .on('end', async () => {
        try {
          // For reviews table, use upsert to handle duplicates
          if (tableName === 'reviews') {
            const { error } = await supabase
              .from(tableName)
              .upsert(rows, { onConflict: 'song_order,participant_email' })
            
            if (error) {
              console.error(`Error importing ${tableName}:`, error)
              reject(error)
            } else {
              console.log(`Successfully imported ${rows.length} rows to ${tableName}`)
              resolve()
            }
          } else {
            // For other tables, try insert first, then upsert if duplicates exist
            const { error } = await supabase
              .from(tableName)
              .insert(rows)
            
            if (error && error.code === '23505') {
              console.log(`${tableName} already has data, skipping...`)
              resolve()
            } else if (error) {
              console.error(`Error importing ${tableName}:`, error)
              reject(error)
            } else {
              console.log(`Successfully imported ${rows.length} rows to ${tableName}`)
              resolve()
            }
          }
        } catch (err) {
          console.error(`Error importing ${tableName}:`, err)
          reject(err)
        }
      })
      .on('error', reject)
  })
}

async function importFilteredReviews(csvFilePath) {
  console.log(`Importing filtered reviews from ${csvFilePath}...`)
  
  // First, get all valid participants (done = true)
  const { data: validParticipants, error: participantsError } = await supabase
    .from('participants')
    .select('email')
    .eq('done', true)
  
  if (participantsError) {
    console.error('Error fetching valid participants:', participantsError)
    throw participantsError
  }
  
  const validEmails = new Set(validParticipants.map(p => p.email))
  console.log(`Found ${validEmails.size} valid participants`)
  
  const rows = []
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Only process reviews for valid participants
        if (validEmails.has(row.participant_email)) {
          // Convert string values to appropriate types
          Object.keys(row).forEach(key => {
            const value = row[key]
            
            // Convert boolean strings
            if (value === 'true') row[key] = true
            if (value === 'false') row[key] = false
            
            // Convert numeric strings
            if (!isNaN(value) && value !== '' && value !== 'true' && value !== 'false') {
              row[key] = parseFloat(value)
            }
            
            // Special handling for ratings - convert integers to proper decimal format
            if (key === 'rating' && typeof row[key] === 'number') {
              // If rating is an integer like 9, convert to 9.00
              if (row[key] % 1 === 0) {
                row[key] = parseFloat(row[key].toFixed(2))
              }
            }
            
            // Convert empty strings to null
            if (value === '') row[key] = null
          })
          
          // Filter to only allowed columns
          const allowedColumns = ['song_order', 'song_title', 'participant_email', 'rating', 'time']
          const filteredRow = {}
          allowedColumns.forEach(col => {
            if (row.hasOwnProperty(col)) {
              filteredRow[col] = row[col]
            }
          })
          
          rows.push(filteredRow)
        }
      })
      .on('end', async () => {
        try {
          console.log(`Filtered to ${rows.length} reviews for valid participants`)
          
          const { error } = await supabase
            .from('reviews')
            .upsert(rows, { onConflict: 'song_order,participant_email' })
          
          if (error) {
            console.error('Error importing reviews:', error)
            reject(error)
          } else {
            console.log(`Successfully imported ${rows.length} reviews`)
            resolve()
          }
        } catch (err) {
          console.error('Error importing reviews:', err)
          reject(err)
        }
      })
      .on('error', reject)
  })
}

async function main() {
  try {
    // Test connection first
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('songs').select('count').limit(1)
    if (error) {
      console.error('Database connection failed:', error)
      console.log('Make sure you have run the SQL schema in your Supabase dashboard first!')
      process.exit(1)
    }
    console.log('Connection successful!')
    
    // Import data in order (songs first, then participants, then reviews)
    await importCSV('songs', './data/songs.csv')
    await importCSV('participants', './data/participants.csv')
    
    // Filter and import reviews (only for participants that exist and have done = true)
    await importFilteredReviews('./data/reviews.csv')
    
    // Clean up data: remove participants where done = false and their reviews
    console.log('Cleaning up data...')
    await cleanupData()
    
    console.log('All data imported and cleaned successfully!')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

async function cleanupData() {
  try {
    // First, get all participants where done = false
    const { data: participantsToRemove, error: participantsError } = await supabase
      .from('participants')
      .select('email')
      .eq('done', false)
    
    if (participantsError) {
      console.error('Error fetching participants to remove:', participantsError)
      return
    }
    
    if (participantsToRemove && participantsToRemove.length > 0) {
      console.log(`Found ${participantsToRemove.length} participants with done = false`)
      
      // Get emails to remove
      const emailsToRemove = participantsToRemove.map(p => p.email)
      
      // Remove reviews for these participants
      const { error: reviewsError } = await supabase
        .from('reviews')
        .delete()
        .in('participant_email', emailsToRemove)
      
      if (reviewsError) {
        console.error('Error removing reviews:', reviewsError)
      } else {
        console.log('Removed reviews for participants with done = false')
      }
      
      // Remove the participants themselves
      const { error: participantsDeleteError } = await supabase
        .from('participants')
        .delete()
        .in('email', emailsToRemove)
      
      if (participantsDeleteError) {
        console.error('Error removing participants:', participantsDeleteError)
      } else {
        console.log(`Removed ${emailsToRemove.length} participants with done = false`)
      }
    } else {
      console.log('No participants with done = false found')
    }
    
    // Also remove any orphaned reviews (reviews without corresponding participants)
    const { data: allParticipants, error: allParticipantsError } = await supabase
      .from('participants')
      .select('email')
    
    if (allParticipantsError) {
      console.error('Error fetching all participants:', allParticipantsError)
      return
    }
    
    const validEmails = allParticipants.map(p => p.email)
    
    // Remove reviews where participant_email is not in the valid participants list
    const { error: orphanedReviewsError } = await supabase
      .from('reviews')
      .delete()
      .not('participant_email', 'in', `(${validEmails.map(email => `'${email}'`).join(',')})`)
    
    if (orphanedReviewsError) {
      console.error('Error removing orphaned reviews:', orphanedReviewsError)
    } else {
      console.log('Removed orphaned reviews')
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

main()
