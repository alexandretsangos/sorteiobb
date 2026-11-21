import { useEffect, useState, useCallback } from 'react';
import { supabase, errMsg } from '../lib/supabase.js';
import { callApi, audit } from '../lib/api.js';
import { computeWinning, pad5, cleanDezenas } from '../lib/raffle.js';
import { fmtDate, fmtDateTime } from '../lib/format.js';
import { toast } from '../components/Toast.jsx';
import { useSite } from '../lib/site.jsx';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function DrawPanel() {
  const { reload: reloadSite } = useSite();
  const [draw, setDraw] = useState(null);
  const [form, setForm] = useState(null);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [manual, setManual] = useState(['', '', '', '', '']);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('draws').select('*').eq('id', 1).single();
    setDraw(data);
    setForm({
      federal_concurso: data.federal_concurso || '',
      registration_closes_at: toLocalInput(data.registration_closes_at),
      calc_mode: data.calc_mode, status: data.status, auto_publish: data.auto_publish, rules_notes: data.rules_notes || '',
    });
    setManual([0, 1, 2, 3, 4].map((i) => data.federal_dezenas?.[i] || ''));
    if (data.winner_entry_id) {
      const { data: w } = await supabase.from('entries').select('full_name, protocol, raffle_number, phone, city, state').eq('id', data.winner_entry_id).maybeSingle();
      setWinner(w);
    } else setWinner(null);
    const { data: h } = await supabase.from('federal_history').select('*').order('concurso', { ascending: false }).limit(20);
    setHistory(h || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function patch(values, action, msg) {
    const { error } = await supabase.from('draws').update(values).eq('id', 1);
    if (error) { toast.error(errMsg(error)); return false; }
    await audit(action, values);
    toast.success(msg); await load(); reloadSite();
    return true;
  }

  async function saveConfig(e) {
    e.preventDefault();
    setBusy('save');
    await patch({
      federal_concurso: form.federal_concurso ? Number(form.federal_concurso) : null,
      registration_closes_at: form.registration_closes_at ? new Date(form.registration_closes_at).toISOString() : null,
      calc_mode: form.calc_mode, status: form.status, auto_publish: form.auto_publish, rules_notes: form.rules_notes,
    }, 'draw.update', 'Configuração do sorteio salva.');
    setBusy('');
  }

  async function detect() {
    setBusy('detect');
    try {
      const r = await callApi('/api/sync-federal?mode=detect');
      set('federal_concurso', r.concurso);
      toast.success(`Concurso ${r.concurso} detectado${r.dataProximo ? ` (próximo sorteio: ${r.dataProximo})` : ''}. Salve para confirmar.`);
    } catch (e) { toast.error(e.message); }
    setBusy('');
  }

  async function syncFederal() {
    setBusy('sync');
    try {
      const r = await callApi('/api/sync-federal', { method: 'POST' });
      if (r.pending) toast.info(r.message);
      else toast.success(`Concurso ${r.concurso}: número ${pad5(r.winning_number)}${r.winner ? ` · protocolo ${r.winner}` : ' · nenhuma cota correspondente'}.`);
      await load();
    } catch (e) { toast.error(e.message); }
    setBusy('');
  }

  async function applyManual() {
    const dez = cleanDezenas(manual);
    const n = computeWinning(dez, form.calc_mode);
    if (n === null) return toast.error(form.calc_mode === 'soma_modulo' ? 'Preencha as 5 dezenas.' : 'Preencha o 1º prêmio.');
    setBusy('manual');
    const { data: w } = await supabase.from('entries').select('id').eq('raffle_number', n).neq('status', 'invalidada').maybeSingle();
    if (form.federal_concurso) {
      await supabase.from('federal_history').upsert({ concurso: Number(form.federal_concurso), dezenas: dez, consultado_em: new Date().toISOString() });
    }
    await patch({
      federal_dezenas: dez, calc_mode: form.calc_mode, winning_number: n, winner_entry_id: w?.id || null, synced_at: new Date().toISOString(),
      federal_concurso: form.federal_concurso ? Number(form.federal_concurso) : null,
      status: draw.status === 'open' ? 'closed' : draw.status,
    }, 'draw.manualResult', `Número calculado: ${pad5(n)}.`);
    setBusy('');
  }

  async function publish() {
    if (draw.winning_number === null) return toast.error('Calcule o número sorteado antes de publicar.');
    setBusy('pub');
    await patch({ status: 'published', published_at: new Date().toISOString() }, 'draw.publish', 'Resultado publicado no site.');
    setBusy('');
  }
  async function reopen() {
    setBusy('reopen');
    await patch({ status: 'open', published_at: null }, 'draw.reopen', 'Sorteio reaberto para inscrições.');
    setBusy('');
  }

  if (!draw || !form) return <p className="muted">Carregando…</p>;
  const preview = computeWinning(manual, form.calc_mode);

  return (
    <>
      <h1>Sorteio e resultado</h1>
      <div className="panel-grid">
        <div className="card">
          <h2>Resultado oficial</h2>
          <ol className="dezenas">
            {[0, 1, 2, 3, 4].map((i) => <li key={i}><span>{i + 1}º prêmio</span><strong className="mono">{draw.federal_dezenas?.[i] || '------'}</strong></li>)}
          </ol>
          <dl className="kv">
            <dt>Concurso</dt><dd>{draw.federal_concurso || '—'}{draw.federal_data ? ` · ${fmtDate(draw.federal_data)}` : ''}</dd>
            <dt>Número sorteado</dt><dd className="mono big">{pad5(draw.winning_number)}</dd>
            <dt>Cota vencedora</dt><dd>{winner ? <><strong>{winner.full_name}</strong><br />{winner.protocol} · {winner.city}/{winner.state}</> : draw.winning_number !== null ? 'nenhuma cota correspondente' : '—'}</dd>
            <dt>Publicado em</dt><dd>{fmtDateTime(draw.published_at)}</dd>
            <dt>Última sincronização</dt><dd>{fmtDateTime(draw.synced_at)}</dd>
          </dl>
          <div className="row-btns">
            <button className="btn btn-ghost" onClick={syncFederal} disabled={!!busy}>{busy === 'sync' ? 'Buscando…' : 'Buscar resultado da Federal agora'}</button>
            <button className="btn" onClick={publish} disabled={!!busy || draw.status === 'published'}>Publicar resultado no site</button>
          </div>
          {draw.status !== 'open' && <button className="link" onClick={reopen} disabled={!!busy}>Reabrir inscrições</button>}
        </div>

        <div className="card">
          <h2>Lançar dezenas manualmente</h2>
          <p className="muted small">Use se a busca automática falhar. Digite os números exatamente como saíram na Federal.</p>
          <div className="manual">
            {manual.map((v, i) => (
              <label key={i}>{i + 1}º<input className="mono" inputMode="numeric" value={v} onChange={(e) => setManual((m) => m.map((x, j) => (j === i ? e.target.value.replace(/\D/g, '').slice(0, 6) : x)))} /></label>
            ))}
          </div>
          <p>Prévia: <strong className="mono">{pad5(preview)}</strong> <span className="muted small">({form.calc_mode === 'soma_modulo' ? 'soma dos 4 últimos dígitos' : '1º prêmio'})</span></p>
          <button className="btn btn-ghost" onClick={applyManual} disabled={!!busy}>Calcular e salvar</button>
        </div>
      </div>

      <form className="card" onSubmit={saveConfig}>
        <h2>Configuração</h2>
        <div className="grid3">
          <label>Concurso da Federal
            <span className="inline"><input inputMode="numeric" value={form.federal_concurso} onChange={(e) => set('federal_concurso', e.target.value.replace(/\D/g, ''))} /><button type="button" className="btn btn-sm btn-ghost" onClick={detect} disabled={!!busy}>Detectar</button></span>
          </label>
          <label>Encerramento das inscrições
            <input type="datetime-local" value={form.registration_closes_at} onChange={(e) => set('registration_closes_at', e.target.value)} />
          </label>
          <label>Regra de cálculo
            <select value={form.calc_mode} onChange={(e) => set('calc_mode', e.target.value)}>
              <option value="soma_modulo">Soma dos 4 últimos dígitos (padrão)</option>
              <option value="primeira_dezena">Só o 1º prêmio</option>
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="open">Abertas</option><option value="closed">Encerradas</option><option value="published">Resultado publicado</option>
            </select>
          </label>
          <label className="check sw">
            <input type="checkbox" checked={form.auto_publish} onChange={(e) => set('auto_publish', e.target.checked)} />
            <span>Publicação automática (rotina manhã e noite)</span>
          </label>
          <label className="full">Texto do regulamento
            <textarea rows="5" value={form.rules_notes} onChange={(e) => set('rules_notes', e.target.value)} />
          </label>
        </div>
        <button className="btn" disabled={!!busy}>{busy === 'save' ? 'Salvando…' : 'Salvar configuração'}</button>
      </form>

      <div className="card">
        <h2>Histórico de concursos consultados</h2>
        {history.length === 0 ? <p className="muted">Nenhum concurso consultado ainda.</p> : (
          <table className="sheet stack">
            <thead><tr><th>Concurso</th><th>Data</th><th>Dezenas</th><th>Consultado em</th></tr></thead>
            <tbody>{history.map((h) => <tr key={h.concurso}><td data-l="Concurso">{h.concurso}</td><td data-l="Data">{fmtDate(h.data)}</td><td data-l="Dezenas" className="mono">{h.dezenas.join(' · ')}</td><td data-l="Consultado em">{fmtDateTime(h.consultado_em)}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
