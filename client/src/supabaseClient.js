import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfcjrxfexuqaxehtsknz.supabase.co';
const supabaseAnonKey = 'sb_publishable_d5PIM5LSpuLKZRJ7l5--dQ_NcYkMsbq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
