export interface Song {
  song_order: number
  track_name: string
  album: string
  year: number
  nrgm_list: boolean
  date: string
  song_length: number
  instrumental: boolean
  lyrics: string
  analysis: string
  main_lines: string
  tags_adjective: string
  tags_noun: string
  sexual_themes: number
  pg13: number
  cancel_target: number
  tragic_story: number
  escapism: number
  antihero: number
  lgbt: number
  substance_abuse: number
  lastfm_sum: number
  lastfm_pos: number
}

export interface Participant {
  created: string
  email: string
  name: string
  gender: string
  decade: string
  urban_rural: string
  city: string
  artist_relationship: number
  winner_prediction: string
  hate_song: string
  explicit_lyrics_relationship: number
  music_relationship: number
  works_in_music: string
  plays_music: string
  format: string
  project_endurance: string
  participation_frequency: string
  google_group: boolean
  nrgm: boolean
  done: boolean
  aft_nps: string
  aft_artist_relationship: number
  aft_winner_prediction: string
  aft_hate_song: string
  aft_explicit_lyrics_relationship: number
  aft_reviewed_as_expected: number
  aft_influenced_by_others: number
}

export interface Review {
  song_order: number
  song_title: string
  participant_email: string
  rating: number
  time: string
}

export interface UserStats {
  totalReviews: number
  averageRating: number
  topSongs: Song[]
  bottomSongs: Song[]
  favoriteDecade: string
  ratingDistribution: Record<string, number>
  participationLevel: string
}

// User type from Supabase Auth
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}
