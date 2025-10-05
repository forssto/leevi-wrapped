# Leevi Wrapped

A Spotify Wrapped-style web application for Leevi's music project, built with Next.js, Supabase, and Vercel.

## Features

- 🔐 Google OAuth authentication via Supabase
- 📊 Personalized dashboard with user statistics
- 🎵 Card-style interface showing top songs and ratings
- 📱 Shareable images for social media
- 🔒 Row-level security for data protection

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Image Generation**: Vercel OG

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your service role key
4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Run the SQL from `supabase-schema.sql` to create the tables and RLS policies
3. Import your CSV data into the three tables:
   - `songs` - Song information and metadata
   - `participants` - User information and survey responses
   - `reviews` - User ratings for each song

### 3. Authentication Setup

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google OAuth
3. Add your Google OAuth credentials
4. Set the redirect URL to `http://localhost:3000/dashboard` (for development)

### 4. Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 5. Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Database Schema

### Songs Table
- `song_order` (PK): Unique identifier for each song
- `track_name`: Song title
- `album`: Album name
- `year`: Release year
- `lyrics`: Full song lyrics
- `analysis`: AI analysis of lyrics
- `main_lines`: Key lyric lines
- Various AI-extracted ratings and tags

### Participants Table
- `email` (PK): User email address
- `name`: User's name
- `gender`, `decade`, `urban_rural`: Demographics
- Survey responses about music preferences
- Pre and post-project relationship ratings

### Reviews Table
- `song_order` (FK): References songs table
- `participant_email` (FK): References participants table
- `rating`: User's rating (4.0-10.0)
- `time`: When the review was submitted

## Security

- Row Level Security (RLS) ensures users can only see their own data
- All database queries are server-side for security
- Google OAuth provides secure authentication

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities
│   └── supabase.ts       # Supabase client
└── types/                # TypeScript types
    └── database.ts       # Database type definitions
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.