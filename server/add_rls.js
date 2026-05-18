const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await db.connect();
  console.log("Connected to DB.");

  const tables = ['clients', 'tasks', 'files', 'projects'];
  
  for (const table of tables) {
    try {
      await db.query(`ALTER TABLE ${table} ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;`);
      console.log(`Added user_id to ${table}`);
    } catch (err) {
      console.log(`Column might already exist on ${table} or error:`, err.message);
    }
  }

  await db.end();
}

run().catch(console.error);
