import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query(`NOTIFY pgrst, 'reload schema'`);
    console.log('Reload signal sent');
  } catch (err) {
    console.error('Error:', err.message);
  }
  await client.end();
}
run();
