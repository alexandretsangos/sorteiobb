// Substituto do Supabase só para a prévia: tudo em memória, com dados de exemplo.
import kitPhoto from './kit.jpg';
import { validCpf, onlyDigits } from '../lib/format.js';

export const configured = true;
export function errMsg(e) { return e?.message || String(e); }

// ---------- dados de exemplo ----------
const FIRST = ['Ana', 'Beatriz', 'Camila', 'Daniela', 'Eduarda', 'Fernanda', 'Gabriela', 'Helena', 'Isabela', 'Juliana', 'Larissa', 'Mariana', 'Natália', 'Patrícia', 'Rafaela', 'Sabrina', 'Tatiane', 'Vanessa', 'Yasmin', 'Letícia', 'Priscila', 'Aline', 'Bruna', 'Jéssica'];
const LAST = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Ribeiro', 'Gomes', 'Martins', 'Araújo', 'Barbosa'];
const CITIES = [['Campinas', 'SP'], ['São Paulo', 'SP'], ['Sorocaba', 'SP'], ['Belo Horizonte', 'MG'], ['Curitiba', 'PR'], ['Goiânia', 'GO'], ['Salvador', 'BA'], ['Recife', 'PE'], ['Rio de Janeiro', 'RJ'], ['Uberlândia', 'MG']];
const SRC = ['Instagram', 'WhatsApp', 'Indicação de amiga', 'Grupo de gestantes', 'Facebook', 'TikTok', 'Outro'];

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];
function fakeCpf() {
  const d = Array.from({ length: 9 }, () => Math.floor(rnd() * 10));
  for (const n of [9, 10]) { let s = 0; for (let i = 0; i < n; i++) s += d[i] * (n + 1 - i); const r = (s * 10) % 11; d.push(r === 10 ? 0 : r); }
  return d.join('');
}
const hex4 = () => Math.floor(rnd() * 65536).toString(16).toUpperCase().padStart(4, '0');

let seq = 0;
const used = new Set();
const db = { entries: [], draws: [], settings: [], federal_history: [], audit_log: [], admin_users: [] };
const now = Date.now();
for (let i = 0; i < 312; i++) {
  const ageDays = Math.floor((1 - Math.sqrt(rnd())) * 30);
  const created = new Date(now - ageDays * 864e5 - rnd() * 864e5 * 0.9);
  let n; do { n = Math.floor(rnd() * 100000); } while (used.has(n)); used.add(n);
  const [city, state] = pick(CITIES);
  const weeks = 6 + Math.floor(rnd() * 34);
  const due = new Date(now + (40 - weeks) * 7 * 864e5);
  seq++;
  db.entries.push({
    id: seq, protocol: `SB2026${String(seq).padStart(5, '0')}${hex4()}`, raffle_number: n,
    full_name: `${pick(FIRST)} ${pick(LAST)} ${pick(LAST)}`, cpf: fakeCpf(),
    phone: `${pick(['11', '19', '15', '31', '41', '62', '71', '81', '21'])}9${String(Math.floor(rnd() * 1e8)).padStart(8, '0')}`,
    email: rnd() > 0.5 ? `contato${seq}@exemplo.com` : null, city, state, gestation_weeks: weeks,
    due_date: rnd() > 0.3 ? due.toISOString().slice(0, 10) : null, formal_job: rnd() > 0.45, discovery_source: pick(SRC),
    privacy_consent: true, marketing_consent: rnd() > 0.4, whatsapp_confirmation_consent: true,
    source: pick(['https://instagram.com/', 'https://l.facebook.com/', 'acesso direto']),
    status: ageDays > 6 ? pick(['validada', 'validada', 'validada', 'invalidada', 'pendente']) : 'pendente',
    notes: null, phone_fix: null, created_at: created.toISOString(),
  });
}
db.draws.push({
  id: 1, slug: 'cesta-bebe-2026', title: 'SORTEIO de prêmios para o seu bebê.',
  subtitle: 'Preencha o cadastro gratuitamente, receba seu número na hora e concorra a uma ajudinha carinhosa para o começo dessa nova fase.',
  prize_title: 'Cesta para bebê', status: 'open', registration_closes_at: new Date(now + 9 * 864e5).toISOString(),
  rules_notes: 'Cada participante recebe um número de 00000 a 99999. O número sorteado é calculado a partir do resultado da Loteria Federal do concurso indicado. Participação gratuita e exclusiva para gestantes. Uma inscrição por CPF.',
  calc_mode: 'soma_modulo', federal_concurso: null, federal_dezenas: null, federal_data: null, synced_at: null,
  winning_number: null, winner_entry_id: null, published_at: null, auto_publish: true,
});
db.settings.push({ id: 1, site_name: 'Sorteio Cesta Bebê', meta_pixel_id: '', whatsapp_number: '11999990000', whatsapp_message: 'Olá! Fiz minha inscrição no Sorteio Cesta Bebê.', instagram: 'sorteiocestabebe', contact_email: 'contato@exemplo.com', prize_image_url: '', hero_image_url: kitPhoto });
db.federal_history.push({ concurso: 6010, data: new Date(now - 4 * 864e5).toISOString().slice(0, 10), dezenas: ['48213', '07765', '91342', '33058', '60417'], consultado_em: new Date(now - 4 * 864e5).toISOString() });
const ADMIN_ID = 'demo-admin';
db.admin_users.push({ user_id: ADMIN_ID, username: 'organizacao@exemplo.com', name: 'Organização', role: 'admin', last_login: new Date(now - 864e5).toISOString(), created_at: new Date(now - 40 * 864e5).toISOString() });
let logId = 0;
export function log(who, action, details) { db.audit_log.push({ id: ++logId, when: new Date().toISOString(), who, action, details: details || null }); }
['login', 'entry.update', 'settings.save', 'entries.exportCsv'].forEach((a, i) => db.audit_log.push({ id: ++logId, when: new Date(now - (i + 1) * 36e5 * 7).toISOString(), who: 'organizacao@exemplo.com', action: a, details: null }));
export const demoDb = db;

// ---------- query builder ----------
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 120));
const cmp = (a, b) => (a === b ? 0 : a === null || a === undefined ? 1 : b === null || b === undefined ? -1 : a < b ? -1 : 1);

function parseOr(str) {
  return str.split(',').map((part) => {
    const [col, op, ...rest] = part.split('.');
    return { col, op, val: rest.join('.') };
  });
}
function match(row, f) {
  const v = row[f.col];
  switch (f.op) {
    case 'eq': return String(v) === String(f.val);
    case 'neq': return String(v) !== String(f.val);
    case 'gte': return v >= f.val;
    case 'ilike': { const needle = f.val.replace(/%/g, '').toLowerCase(); return String(v ?? '').toLowerCase().includes(needle); }
    case 'or': return f.val.some((g) => match(row, g));
    default: return true;
  }
}

class Query {
  constructor(table) { this.t = table; this.filters = []; this.kind = 'select'; this.opts = {}; }
  select(_cols, opts = {}) { if (this.kind === 'select') this.opts = opts; return this; }
  eq(col, val) { this.filters.push({ col, op: 'eq', val }); return this; }
  neq(col, val) { this.filters.push({ col, op: 'neq', val }); return this; }
  gte(col, val) { this.filters.push({ col, op: 'gte', val }); return this; }
  or(str) { this.filters.push({ op: 'or', val: parseOr(str) }); return this; }
  order(col, { ascending = true } = {}) { this.ord = { col, ascending }; return this; }
  range(a, b) { this.rng = [a, b]; return this; }
  limit(n) { this.rng = [0, n - 1]; return this; }
  single() { this.one = 'single'; return this; }
  maybeSingle() { this.one = 'maybe'; return this; }
  update(vals) { this.kind = 'update'; this.vals = vals; return this; }
  delete() { this.kind = 'delete'; return this; }
  insert(vals) { this.kind = 'insert'; this.vals = vals; return this; }
  upsert(vals) { this.kind = 'upsert'; this.vals = vals; return this; }
  exec() {
    const rows = db[this.t];
    const hit = rows.filter((r) => this.filters.every((f) => match(r, f)));
    if (this.kind === 'update') { hit.forEach((r) => Object.assign(r, this.vals)); if (this.t === 'entries') hit.forEach((r) => log('organizacao@exemplo.com', 'entry.update', { protocol: r.protocol, status: r.status })); return { data: null, error: null }; }
    if (this.kind === 'delete') { hit.forEach((r) => { rows.splice(rows.indexOf(r), 1); if (this.t === 'entries') log('organizacao@exemplo.com', 'entry.remove', { protocol: r.protocol }); }); return { data: null, error: null }; }
    if (this.kind === 'insert') { const v = { ...this.vals }; if (this.t === 'audit_log') { v.id = ++logId; v.when = new Date().toISOString(); } rows.push(v); return { data: null, error: null }; }
    if (this.kind === 'upsert') { const key = this.t === 'federal_history' ? 'concurso' : 'id'; const ex = rows.find((r) => r[key] === this.vals[key]); if (ex) Object.assign(ex, this.vals); else rows.push({ ...this.vals }); return { data: null, error: null }; }
    let out = hit.slice();
    if (this.ord) out.sort((a, b) => cmp(a[this.ord.col], b[this.ord.col]) * (this.ord.ascending ? 1 : -1));
    const count = out.length;
    if (this.rng) out = out.slice(this.rng[0], this.rng[1] + 1);
    if (this.opts.head) return { data: null, count, error: null };
    out = out.map((r) => ({ ...r }));
    if (this.one) return { data: out[0] || null, error: this.one === 'single' && !out[0] ? { message: 'Não encontrado' } : null };
    return { data: out, count: this.opts.count ? count : null, error: null };
  }
  then(res, rej) { return wait(this.exec()).then(res, rej); }
}

// ---------- RPCs ----------
function publicStatus() {
  const d = db.draws[0]; const pub = d.status === 'published';
  return {
    status: d.status, registration_closes_at: d.registration_closes_at, rules_notes: d.rules_notes, calc_mode: d.calc_mode,
    federal_concurso: pub ? d.federal_concurso : null, federal_dezenas: pub ? d.federal_dezenas : null, federal_data: pub ? d.federal_data : null,
    winning_number: pub ? d.winning_number : null, published_at: d.published_at, title: d.title, subtitle: d.subtitle, prize_title: d.prize_title,
    settings: { ...db.settings[0] },
  };
}
function register(p) {
  const fail = (m) => ({ data: null, error: { message: m } });
  const d = db.draws[0];
  if (d.status !== 'open') return fail('Inscrições encerradas.');
  const cpf = onlyDigits(p.cpf);
  const ex = db.entries.find((e) => e.cpf === cpf);
  if (ex) return { data: { existing: true, raffle_number: ex.raffle_number, protocol: ex.protocol }, error: null };
  if (!validCpf(cpf)) return fail('CPF inválido.');
  let n; do { n = Math.floor(Math.random() * 100000); } while (db.entries.some((e) => e.raffle_number === n));
  seq++;
  const protocol = `SB2026${String(seq).padStart(5, '0')}${Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0')}`;
  db.entries.push({ id: seq, protocol, raffle_number: n, full_name: p.full_name.trim(), cpf, phone: p.phone, email: p.email || null, city: p.city, state: p.state,
    gestation_weeks: Number(p.gestation_weeks), due_date: p.due_date || null, formal_job: p.formal_job, discovery_source: p.discovery_source || null,
    privacy_consent: true, marketing_consent: !!p.marketing_consent, whatsapp_confirmation_consent: true, source: 'prévia', status: 'pendente', notes: null, phone_fix: null, created_at: new Date().toISOString() });
  log('site', 'entry.create', { protocol });
  return { data: { existing: false, raffle_number: n, protocol }, error: null };
}
function lookup(prot) {
  const e = db.entries.find((x) => x.protocol === String(prot).trim().toUpperCase());
  if (!e) return { found: false };
  const d = db.draws[0];
  return { found: true, raffle_number: e.raffle_number, first_name: e.full_name.split(' ')[0], published: d.status === 'published', winner: d.status === 'published' && d.winner_entry_id === e.id };
}

// ---------- auth ----------
let session = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn('change', session));

export const supabase = {
  from: (t) => new Query(t),
  rpc: (name, args) => {
    if (name === 'public_status') return wait({ data: publicStatus(), error: null });
    if (name === 'register_entry') return wait(register(args.p));
    if (name === 'lookup_protocol') return wait({ data: lookup(args.p_protocol), error: null });
    return wait({ data: null, error: { message: 'rpc desconhecida' } });
  },
  auth: {
    getSession: async () => ({ data: { session } }),
    getUser: async () => ({ data: { user: session?.user || null } }),
    onAuthStateChange: (fn) => { listeners.add(fn); return { data: { subscription: { unsubscribe: () => listeners.delete(fn) } } }; },
    signInWithPassword: async ({ email }) => {
      await wait();
      session = { access_token: 'demo', user: { id: ADMIN_ID, email: email || 'organizacao@exemplo.com' } };
      emit();
      return { data: { user: session.user }, error: null };
    },
    signOut: async () => { session = null; emit(); return { error: null }; },
    updateUser: async () => wait({ data: {}, error: null }),
  },
};
