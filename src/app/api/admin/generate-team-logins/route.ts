import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST() {
  try {
    // 1. Authenticate the admin
    const authClient = await createServerSupabaseClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await authClient.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Initialize the admin client to bypass RLS and use Auth Admin API
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 3. Fetch all teams
    const { data: teams, error: teamsError } = await authClient.from('teams').select('*').order('name')
    if (teamsError || !teams) {
      throw new Error(teamsError?.message || 'Failed to fetch teams')
    }

    const generatedCredentials = []

    // 4. Generate logins for each team
    for (const team of teams) {
      const cleanName = (team.short_name || team.name).toLowerCase().replace(/[^a-z0-9]/g, '')
      const email = `${cleanName}@inpl.com`
      const password = crypto.randomBytes(4).toString('hex') // 8 chars random password

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)

      let userId = ''
      if (existingUser) {
        // Just update their password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password })
        if (updateError) {
          console.error('Failed to update password for', email, updateError)
          continue
        }
        userId = existingUser.id
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: team.name }
        })
        
        if (createError) {
          console.error('Error creating user for team:', team.name, createError)
          continue // skip if error
        }
        userId = newUser.user.id
      }

      // Ensure their profile is linked to the team
      if (userId) {
        const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
          id: userId,
          email: email,
          full_name: team.name,
          role: 'TEAM',
          team_id: team.id,
          updated_at: new Date().toISOString()
        })
        
        if (upsertError) {
           console.error('Failed to upsert profile for', email, upsertError)
        }

        generatedCredentials.push({
          teamName: team.name,
          email,
          password
        })
      }
    }

    return NextResponse.json({ credentials: generatedCredentials })

  } catch (error: any) {
    console.error('Generate logins error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
