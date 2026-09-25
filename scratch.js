require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: teams } = await supabase.from('teams').select('*');
  const { data: squads } = await supabase.from('squads').select('*');

  for (const team of teams) {
    const teamSquads = squads.filter(s => s.team_id === team.id);
    const actualCount = teamSquads.length;
    const actualSpent = teamSquads.reduce((acc, curr) => acc + Number(curr.purchase_price), 0);
    const actualRemaining = Number(team.initial_purse) - actualSpent;
    
    if (team.players_count !== actualCount || Number(team.remaining_purse) !== actualRemaining) {
      console.log(`Team ${team.name} is out of sync. Fixing...`);
      const { error } = await supabase
        .from('teams')
        .update({ players_count: actualCount, remaining_purse: actualRemaining })
        .eq('id', team.id);
      if (error) console.error('Error fixing team:', error);
      else console.log(`Fixed ${team.name} to ${actualCount} players, ${actualRemaining} purse`);
    }
  }
}
run();
