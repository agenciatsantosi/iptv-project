import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndcvhovimrlakbowsrxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kY3Zob3ZpbXJsYWtib3dzcnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTY1NzgsImV4cCI6MjA1MTQzMjU3OH0.AN5bW3P6qdlm_NK3SGLF2VhLry98rRYYhomExcsyNHs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  }
});