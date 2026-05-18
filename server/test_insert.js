const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
  let { data, error } = await supabase.auth.signUp({ email: 'priyanktest123@gmail.com', password: 'password123' });
  if (error && error.message.includes('already registered')) {
    const res = await supabase.auth.signInWithPassword({ email: 'priyanktest123@gmail.com', password: 'password123' });
    data = res.data;
  }
  
  if (!data.session) {
    console.log("No session. Error:", error);
    return;
  }

  const token = data.session.access_token;
  console.log("Got token.");

  try {
    const res = await axios.post('https://ca-workspace.onrender.com/api/clients', {
      name: 'Test Client',
      pan: 'ABCDE1234F',
      category: 'Individual'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}
run();
