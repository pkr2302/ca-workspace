const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

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

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ error: 'Invalid token' });
  
  req.user = user;
  next();
};

const upload = multer({ storage: multer.memoryStorage() });

// Apply auth middleware to all API routes
app.use('/api', authenticateToken);

// --- API ROUTES ---

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, pan, category } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO clients (name, pan, category, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, pan, category, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { title, description, client_id, status } = req.body;
  const cId = client_id ? parseInt(client_id) : null;
  try {
    const result = await db.query(
      'INSERT INTO projects (title, description, client_id, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, cId, status || 'active', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { title, description, client_id, status } = req.body;
  const cId = client_id ? parseInt(client_id) : null;
  try {
    const result = await db.query(
      'UPDATE projects SET title = $1, description = $2, client_id = $3, status = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, description, cId, status, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, date, reminder, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tasks (title, date, reminder, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, date, reminder, status || 'pending', req.user.id]
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
      'UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.user.id]
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
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `${req.user.id}/${client_id}/${fileName}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
      
    if (storageError) throw storageError;

    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    const result = await db.query(
      'INSERT INTO files (client_id, filename, filepath, type, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [client_id, req.file.originalname, publicUrl, type, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/:client_id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM files WHERE client_id = $1 AND user_id = $2 ORDER BY id DESC', [req.params.client_id, req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful AI assistant built directly into a Chartered Accountant Dashboard. Help the user answer any questions concisely. Question: ${message}`,
    });
    res.json({ reply: response.text });
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static files
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api')) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
