const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await db.connect();
  console.log("Connected to DB.");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await db.query(createTableQuery);
  console.log("Projects table created.");

  await db.end();
}

run().catch(console.error);
