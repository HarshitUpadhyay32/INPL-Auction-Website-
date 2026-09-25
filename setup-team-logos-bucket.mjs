import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
  console.log('Creating team-logos bucket...')
  
  const { data, error } = await supabase.storage.createBucket('team-logos', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'],
    fileSizeLimit: 5242880 // 5MB
  })
  
  if (error && error.message !== 'The resource already exists') {
    console.error('Error creating bucket:', error)
  } else {
    console.log('Bucket created successfully (or already exists).')
  }
}

setup()
