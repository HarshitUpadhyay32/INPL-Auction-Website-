import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
  console.log('Creating player-photos bucket...')
  
  // Create the bucket
  const { data, error } = await supabase.storage.createBucket('player-photos', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  })
  
  if (error && error.message !== 'The resource already exists') {
    console.error('Error creating player-photos bucket:', error)
  } else {
    console.log('player-photos bucket created successfully (or already exists).')
  }

  console.log('Creating team-logos bucket...')
  
  // Create the bucket
  const { data: teamData, error: teamError } = await supabase.storage.createBucket('team-logos', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'],
    fileSizeLimit: 5242880 // 5MB
  })
  
  if (teamError && teamError.message !== 'The resource already exists') {
    console.error('Error creating team-logos bucket:', teamError)
  } else {
    console.log('team-logos bucket created successfully (or already exists).')
  }

  // To allow public upload we need RLS policies, or we can just let users upload it via the API with their session if RLS allows.
  // Wait, the client is using the ANON key. By default, new buckets deny all access.
  // Let's create an RLS policy that allows public inserts. (Not ideal for production but for this event it's fine)
  
  // Note: we can't easily create RLS policies through the JS client `createBucket`, 
  // so we'll execute an SQL query if possible, but the JS client doesn't support arbitrary SQL execution directly without RPC.
  
  // Let's test uploading a file with the service role to ensure bucket exists
}

setup()
