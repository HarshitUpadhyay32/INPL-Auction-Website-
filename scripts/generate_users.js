const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function run() {
  const { data: teams, error: teamsError } = await supabase.from('teams').select('id, name').order('name');
  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    return;
  }

  const generatedUsers = [];
  
  const createAccount = async (email, password, role, teamId, fullName) => {
    // 1. Create in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role }
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log(`User ${email} already exists, skipping...`);
        return null;
      }
      console.error(`Error creating user ${email}:`, authError);
      return null;
    }

    const user = authData.user;

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: email,
      full_name: fullName,
      role: role,
      team_id: teamId || null,
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.error(`Error creating profile for ${email}:`, profileError);
    }

    return { email, password, role, teamName: fullName };
  };

  // Generate 5 Admins
  for (let i = 1; i <= 5; i++) {
    const p = generatePassword();
    const res = await createAccount(`admin${i}@inpl.com`, p, 'ADMIN', null, `Admin ${i}`);
    if (res) generatedUsers.push(res);
  }

  // Generate 10 Teams
  for (let i = 1; i <= 10; i++) {
    const p = generatePassword();
    const team = teams[i - 1]; // 8 teams exist, 2 will be undefined
    const teamId = team ? team.id : null;
    const teamName = team ? team.name : `Generic Team ${i}`;
    const res = await createAccount(`team${i}@inpl.com`, p, 'TEAM', teamId, teamName);
    if (res) generatedUsers.push(res);
  }

  // Generate 5 Public users
  for (let i = 1; i <= 5; i++) {
    const p = generatePassword();
    const res = await createAccount(`public${i}@inpl.com`, p, 'PUBLIC', null, `Public Spectator ${i}`);
    if (res) generatedUsers.push(res);
  }

  console.log(JSON.stringify(generatedUsers, null, 2));
}

run();
