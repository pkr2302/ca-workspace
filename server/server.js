const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

require('dotenv').config();

// Supabase Config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Postgres Config
const connStr = process.env.DATABASE_URL;
const db = new Client({ connectionString: connStr });
db.connect().then(() => console.log('Connected to Supabase PostgreSQL')).catch(err => console.error(err));

// Setup Multer for memory storage (for uploading to Supabase)
const upload = multer({ storage: multer.memoryStorage() });

// --- API ROUTES ---

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, pan, category } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO clients (name, pan, category) VALUES ($1, $2, $3) RETURNING *',
      [name, pan, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, date, reminder, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tasks (title, date, reminder, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, date, reminder, status || 'pending']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await db.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Files
app.post('/api/files', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { client_id, type } = req.body;
  
  try {
    // 1. Upload to Supabase Storage
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `${client_id}/${fileName}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
      
    if (storageError) throw storageError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    // 2. Insert record into Postgres
    const result = await db.query(
      'INSERT INTO files (client_id, filename, filepath, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [client_id, req.file.originalname, publicUrl, type]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/:client_id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM files WHERE client_id = $1 ORDER BY id DESC', [req.params.client_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the React app
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// The "catchall" handler
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    next();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
