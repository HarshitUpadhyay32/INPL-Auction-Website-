import { Client } from 'pg';
import * as fs from 'fs';

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
  try {
    await client.query(sql);
    console.log('Schema applied successfully');
  } catch (err) {
    console.error('Schema Error:', err.message);
  }
  await client.end();
}
run();
