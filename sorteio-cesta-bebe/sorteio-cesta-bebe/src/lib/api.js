import { supabase } from './supabase.js';

export async function callApi(path, { method = 'GET', body } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const r = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = {};
  try { j = await r.json(); } catch { j = { error: `Resposta inválida (HTTP ${r.status}). A função da Vercel está publicada?` }; }
  if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

export async function audit(action, details) {
  const { data } = await supabase.auth.getUser();
  await supabase.from('audit_log').insert({ who: data.user?.email || 'admin', action, details: details || null });
}
