// Lista e cria acessos do painel (usa a service role, por isso fica no servidor).
import { serviceClient, requireAdmin, send } from './_lib.js';

export default async function handler(req, res) {
  let db;
  try { db = serviceClient(); } catch (e) { return send(res, 500, { error: e.message }); }
  const admin = await requireAdmin(req, db);
  if (!admin) return send(res, 401, { error: 'Não autorizado.' });

  if (req.method === 'GET') {
    const { data, error } = await db.from('admin_users').select('username, name, role, last_login, created_at').order('created_at');
    if (error) return send(res, 500, { error: error.message });
    return send(res, 200, { users: data });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 400, { error: 'E-mail inválido.' });
    if (password.length < 6) return send(res, 400, { error: 'A senha precisa ter pelo menos 6 caracteres.' });

    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return send(res, 400, { error: error.message });
    const { error: insErr } = await db.from('admin_users').insert({ user_id: data.user.id, username: email, name });
    if (insErr) return send(res, 500, { error: insErr.message });
    await db.from('audit_log').insert({ who: admin.username, action: 'user.create', details: { username: email } });
    return send(res, 200, { ok: true });
  }

  return send(res, 405, { error: 'Método não permitido.' });
}
