'use client'

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <br />
          <code className="bg-gray-100 p-2 block mt-1">
            {supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET'}
          </code>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <br />
          <code className="bg-gray-100 p-2 block mt-1">
            {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'}
          </code>
        </div>
        <div>
          <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>
          <br />
          <code className="bg-gray-100 p-2 block mt-1">
            {serviceKey ? `${serviceKey.substring(0, 20)}...` : 'NOT SET'}
          </code>
        </div>
        <div>
          <strong>All variables present:</strong>
          <br />
          <code className="bg-gray-100 p-2 block mt-1">
            {supabaseUrl && supabaseAnonKey && serviceKey ? 'YES' : 'NO'}
          </code>
        </div>
      </div>
    </div>
  )
}
