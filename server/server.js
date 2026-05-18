const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

require('dotenv').config();

// Supabase Config (Uses HTTPS, fully avoids IPv6/IPv4 database connection issues!)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const { data, error } = await supabase.from('clients').select('*').eq('user_id', req.user.id).order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/clients', async (req, res) => {
  const { name, pan, category } = req.body;
  const { data, error } = await supabase.from('clients').insert([{ name, pan, category, user_id: req.user.id }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.delete('/api/clients/:id', async (req, res) => {
  const { data, error } = await supabase.from('clients').delete().eq('id', req.params.id).eq('user_id', req.user.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: data ? data.length : 0 });
});

// Projects
app.get('/api/projects', async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*').eq('user_id', req.user.id).order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/projects', async (req, res) => {
  const { title, description, client_id, status } = req.body;
  const cId = client_id ? parseInt(client_id) : null;
  const { data, error } = await supabase.from('projects').insert([{ title, description, client_id: cId, status: status || 'active', user_id: req.user.id }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/projects/:id', async (req, res) => {
  const { title, description, client_id, status } = req.body;
  const cId = client_id ? parseInt(client_id) : null;
  const { data, error } = await supabase.from('projects').update({ title, description, client_id: cId, status }).eq('id', req.params.id).eq('user_id', req.user.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/projects/:id', async (req, res) => {
  const { error } = await supabase.from('projects').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', req.user.id).order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/tasks', async (req, res) => {
  const { title, date, reminder, status } = req.body;
  const { data, error } = await supabase.from('tasks').insert([{ title, date, reminder, status: status || 'pending', user_id: req.user.id }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('tasks').update({ status }).eq('id', req.params.id).eq('user_id', req.user.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: data ? data.length : 0 });
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

    const { data, error } = await supabase.from('files').insert([{ client_id, filename: req.file.originalname, filepath: publicUrl, type, user_id: req.user.id }]).select().single();
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/:client_id', async (req, res) => {
  const { data, error } = await supabase.from('files').select('*').eq('client_id', req.params.client_id).eq('user_id', req.user.id).order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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
