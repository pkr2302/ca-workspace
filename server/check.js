const { Client } = require('pg');
require('dotenv').config();

const db = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await db.connect();
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients';
    `);
    console.log("CLIENTS SCHEMA:", res.rows);
  } catch (err) {
    console.error("DB Error:", err);
  }
  await db.end();
}
run();
