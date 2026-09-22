import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function seed() {
  console.log('Seeding users...')

  // 1. Create Admin
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@inpl.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      role: 'ADMIN',
      full_name: 'Super Admin'
    }
  })

  if (adminError) console.error('Admin creation error:', adminError.message)
  else console.log('Admin user created successfully!')

  // 2. Create Team
  const { data: teamData, error: teamError } = await supabaseAdmin.auth.admin.createUser({
    email: 'team@inpl.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      role: 'TEAM',
      full_name: 'Team Owner'
    }
  })

  if (teamError) console.error('Team creation error:', teamError.message)
  else {
    console.log('Team user created successfully!')
    // Create a team entry for this user
    if (teamData.user) {
      const { error: insertError } = await supabaseAdmin.from('teams').insert({
        name: 'Mumbai Mavericks',
        short_name: 'MM',
        color: '#0033FF',
        purse: 250000000,
        remaining_purse: 250000000,
        max_players: 12,
        user_id: teamData.user.id
      })
      if (insertError) console.error('Team entry creation error:', insertError.message)
      else console.log('Team entry created successfully!')
    }
  }

  console.log('Seeding finished!')
}

seed()
