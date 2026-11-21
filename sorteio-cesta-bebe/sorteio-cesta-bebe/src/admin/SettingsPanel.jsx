import { useEffect, useState } from 'react';
import { supabase, errMsg } from '../lib/supabase.js';
import { callApi, audit } from '../lib/api.js';
import { fmtDateTime } from '../lib/format.js';
import { toast } from '../components/Toast.jsx';
import { useSite } from '../lib/site.jsx';

const FIELDS = [
  ['site_name', 'Nome do sorteio'],
  ['meta_pixel_id', 'Pixel da Meta (ID)'],
  ['whatsapp_number', 'WhatsApp da organização (com DDD)'],
  ['whatsapp_message', 'Mensagem padrão do WhatsApp'],
  ['instagram', 'Instagram'],
  ['contact_email', 'E-mail de contato'],
  ['prize_image_url', 'URL da imagem do prêmio'],
  ['hero_image_url', 'URL da imagem do topo (opcional)'],
];

export default function SettingsPanel({ admin }) {
  const { reload } = useSite();
  const [s, setS] = useState(null);
  const [pw, setPw] = useState({ a: '', b: '' });
  const [users, setUsers] = useState([]);
  const [nu, setNu] = useState({ email: '', name: '', password: '' });
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState('');

  async function loadUsers() {
    try { const r = await callApi('/api/admin-users'); setUsers(r.users); }
    catch {
      const { data } = await supabase.from('admin_users').select('username, name, role, last_login, created_at').order('created_at');
      setUsers(data || []);
    }
  }
  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single().then(({ data }) => setS(data));
    supabase.from('audit_log').select('*').order('when', { ascending: false }).limit(60).then(({ data }) => setLog(data || []));
    loadUsers();
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy('s');
    const { id, ...vals } = s;
    const { error } = await supabase.from('settings').update(vals).eq('id', 1);
    setBusy('');
    if (error) return toast.error(errMsg(error));
    await audit('settings.save');
    toast.success('Configurações salvas.'); reload();
  }

  async function changePw(e) {
    e.preventDefault();
    if (pw.a.length < 6) return toast.error('A nova senha precisa ter pelo menos 6 caracteres.');
    if (pw.a !== pw.b) return toast.error('As senhas não conferem.');
    setBusy('p');
    const { error } = await supabase.auth.updateUser({ password: pw.a });
    setBusy('');
    if (error) return toast.error(errMsg(error));
    await audit('user.changePassword');
    setPw({ a: '', b: '' }); toast.success('Senha alterada.');
  }

  async function createUser(e) {
    e.preventDefault();
    setBusy('u');
    try {
      await callApi('/api/admin-users', { method: 'POST', body: nu });
      toast.success('Acesso criado.'); setNu({ email: '', name: '', password: '' }); loadUsers();
    } catch (err) { toast.error(err.message); }
    setBusy('');
  }

  return (
    <>
      <h1>Configurações</h1>
      {s && (
        <form className="card" onSubmit={save}>
          <h2>Site</h2>
          <div className="grid2">
            {FIELDS.map(([k, l]) => (
              <label key={k} className={k === 'whatsapp_message' ? 'full' : ''}>{l}
                {k === 'whatsapp_message'
                  ? <textarea rows="2" value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
                  : <input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} />}
              </label>
            ))}
          </div>
          <button className="btn" disabled={busy === 's'}>Salvar</button>
        </form>
      )}

      <div className="panel-grid">
        <form className="card" onSubmit={changePw}>
          <h2>Trocar a minha senha</h2>
          <p className="muted small">Conectado como {admin.username}.</p>
          <label>Nova senha<input type="password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} autoComplete="new-password" /></label>
          <label>Repita a nova senha<input type="password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} autoComplete="new-password" /></label>
          <button className="btn" disabled={busy === 'p'}>Trocar senha</button>
        </form>

        <form className="card" onSubmit={createUser}>
          <h2>Acessos ao painel</h2>
          <ul className="users">
            {users.map((u) => <li key={u.username}><strong>{u.name || u.username}</strong><span className="muted small">{u.username} · último login {fmtDateTime(u.last_login)}</span></li>)}
          </ul>
          <div className="grid2">
            <label>E-mail (usuário)<input type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} required /></label>
            <label>Nome<input value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} /></label>
            <label className="full">Senha<input type="password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} minLength={6} required autoComplete="new-password" /></label>
          </div>
          <button className="btn btn-ghost" disabled={busy === 'u'}>Criar acesso</button>
        </form>
      </div>

      <div className="card">
        <h2>Histórico de ações</h2>
        <p className="muted small">Últimas 60.</p>
        <table className="sheet stack">
          <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhes</th></tr></thead>
          <tbody>
            {log.map((l) => (
              <tr key={l.id}><td data-l="Quando" className="small">{fmtDateTime(l.when)}</td><td data-l="Quem">{l.who}</td><td data-l="Ação" className="mono small">{l.action}</td><td data-l="Detalhes" className="small muted">{l.details ? Object.entries(l.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' · ') : ''}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
