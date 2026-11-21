// Funções da Vercel simuladas para a prévia.
import { demoDb as db, log } from './supabase.demo.js';
import { computeWinning } from '../lib/raffle.js';

const wait = (v) => new Promise((r) => setTimeout(() => r(v), 400));

export async function callApi(path, { method = 'GET', body } = {}) {
  if (path.includes('mode=detect')) return wait({ concurso: 6012, ultimo: 6011, dataProximo: 'quarta-feira' });
  if (path.startsWith('/api/sync-federal')) {
    const d = db.draws[0];
    if (!d.federal_concurso) throw new Error('Defina o número do concurso (ou use "Detectar").');
    const dezenas = ['52871', '19406', '83325', '04790', '67158'];
    const winning = computeWinning(dezenas, d.calc_mode);
    const w = db.entries.find((e) => e.raffle_number === winning && e.status !== 'invalidada');
    Object.assign(d, { federal_dezenas: dezenas, federal_data: new Date().toISOString().slice(0, 10), synced_at: new Date().toISOString(), winning_number: winning, winner_entry_id: w?.id || null, status: d.status === 'open' ? 'closed' : d.status });
    const h = db.federal_history.find((x) => x.concurso === d.federal_concurso);
    if (!h) db.federal_history.push({ concurso: d.federal_concurso, data: d.federal_data, dezenas, consultado_em: d.synced_at });
    log('organizacao@exemplo.com', 'draw.syncFederal', { concurso: d.federal_concurso, winning });
    return wait({ ok: true, concurso: d.federal_concurso, dezenas, winning_number: winning, winner: w?.protocol || null });
  }
  if (path === '/api/admin-users' && method === 'GET') return wait({ users: db.admin_users.map(({ user_id, ...u }) => u) });
  if (path === '/api/admin-users' && method === 'POST') {
    if ((body.password || '').length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
    db.admin_users.push({ user_id: Math.random().toString(36), username: body.email, name: body.name, role: 'admin', last_login: null, created_at: new Date().toISOString() });
    log('organizacao@exemplo.com', 'user.create', { username: body.email });
    return wait({ ok: true });
  }
  throw new Error('Rota desconhecida na prévia.');
}

export async function audit(action, details) { log('organizacao@exemplo.com', action, details); }
