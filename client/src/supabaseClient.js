import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftrcfgmlvfcgwhtiufgf.supabase.co';
const supabaseAnonKey = 'sb_publishable_vw_uoTIyS4nNcZR_6A_pXQ_lvuHMgv6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
