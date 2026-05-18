const { Client } = require('pg');

async function setup() {
  const connStr = 'postgresql://postgres:PRI@2302yank@db.ftrcfgmlvfcgwhtiufgf.supabase.co:5432/postgres';
  const client = new Client({ connectionString: connStr });
  
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    // 1. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        pan TEXT,
        category TEXT
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT,
        reminder INTEGER,
        status TEXT DEFAULT 'pending'
      );
      
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        filename TEXT,
        filepath TEXT,
        type TEXT
      );
    `);
    console.log('Tables created successfully.');

    // 2. Create Storage Bucket
    await client.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('uploads', 'uploads', true) 
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Storage bucket created.');

    // 3. Create RLS Policies to allow anonymous uploads/reads
    // Drop existing policies if any to avoid errors
    await client.query(`
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
      DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
      
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
      CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
    `);
    console.log('Storage RLS policies configured.');

  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    await client.end();
  }
}

setup();
