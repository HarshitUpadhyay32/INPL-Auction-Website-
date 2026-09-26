const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: teams } = await supabase.from('teams').select('*');
  const { data: players } = await supabase.from('players').select('sold_to_team_id, sold_price').eq('status', 'SOLD');
  
  for (const team of teams) {
    const teamPlayers = (players || []).filter(p => p.sold_to_team_id === team.id);
    const players_count = teamPlayers.length;
    const spent = teamPlayers.reduce((sum, p) => sum + (p.sold_price || 0), 0);
    const remaining_purse = Number(team.initial_purse) - spent;
    
    await supabase.from('teams').update({
      players_count,
      remaining_purse
    }).eq('id', team.id);
    
    console.log(`Synced ${team.name}: ${players_count} players, ${remaining_purse} purse left`);
  }
}
run();
