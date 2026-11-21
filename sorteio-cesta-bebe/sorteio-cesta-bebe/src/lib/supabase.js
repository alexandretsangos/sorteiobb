import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
export const supabase = configured ? createClient(url, key) : null;

export function errMsg(e) {
  if (!e) return 'Erro desconhecido.';
  return e.message || e.error_description || String(e);
}
