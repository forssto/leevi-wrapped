import { NextRequest } from 'next/server'
import { ImageResponse } from '@vercel/og'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const totalReviews = searchParams.get('totalReviews')
  const averageRating = searchParams.get('averageRating')

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '60px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 20px 0',
            }}
          >
            {name}&apos;s Leevi Wrapped
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {totalReviews}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Songs Reviewed
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {averageRating}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
