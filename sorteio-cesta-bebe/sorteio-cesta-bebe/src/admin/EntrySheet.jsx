import { useEffect, useState, useCallback, Fragment } from 'react';
import { supabase, errMsg } from '../lib/supabase.js';
import { pad5 } from '../lib/raffle.js';
import { fmtDate, fmtDateTime, maskCpf, maskPhone, onlyDigits } from '../lib/format.js';
import { toast } from '../components/Toast.jsx';
import { audit } from '../lib/api.js';

const FILTERS = [['todas', 'Todas'], ['pendente', 'Pendentes'], ['validada', 'Validadas'], ['invalidada', 'Invalidadas']];
const SORTS = {
  recentes: ['created_at', false], antigas: ['created_at', true], numero: ['raffle_number', true], nome: ['full_name', true],
};
const STATUS_LABEL = { pendente: 'Pendente', validada: 'Validada', invalidada: 'Invalidada' };

function applySearch(q, term) {
  const t = term.trim().replace(/[,()%*]/g, ' ').trim();
  if (!t) return q;
  const d = onlyDigits(t);
  const ors = [`full_name.ilike.%${t}%`, `protocol.ilike.%${t}%`, `city.ilike.%${t}%`];
  if (d) {
    ors.push(`cpf.ilike.%${d}%`, `phone.ilike.%${d}%`);
    if (d.length <= 5 && d === t) ors.push(`raffle_number.eq.${Number(d)}`);
  }
  return q.or(ors.join(','));
}

export default function EntrySheet() {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('todas');
  const [sort, setSort] = useState('recentes');
  const [size, setSize] = useState(25);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { const t = setTimeout(() => { setDebounced(term); setPage(0); }, 300); return () => clearTimeout(t); }, [term]);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('entries').select('*', { count: 'exact' });
    if (filter !== 'todas') q = q.eq('status', filter);
    q = applySearch(q, debounced);
    const [col, asc] = SORTS[sort];
    q = q.order(col, { ascending: asc }).range(page * size, page * size + size - 1);
    const { data, count, error } = await q;
    setLoading(false);
    if (error) { toast.error(errMsg(error)); return; }
    setRows(data || []); setTotal(count || 0);
  }, [filter, debounced, sort, page, size]);
  useEffect(() => { load(); }, [load]);

  async function exportCsv() {
    setExporting(true);
    const all = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from('entries').select('*').order('raffle_number').range(from, from + 999);
      if (error) { toast.error(errMsg(error)); setExporting(false); return; }
      all.push(...data);
      if (data.length < 1000) break;
    }
    const cols = ['raffle_number', 'protocol', 'full_name', 'cpf', 'phone', 'phone_fix', 'email', 'city', 'state', 'gestation_weeks', 'due_date', 'formal_job', 'discovery_source', 'privacy_consent', 'marketing_consent', 'whatsapp_confirmation_consent', 'source', 'status', 'notes', 'created_at'];
    const esc = (v) => { const s = v === null || v === undefined ? '' : String(v); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = '﻿' + [cols.join(';'), ...all.map((r) => cols.map((c) => esc(c === 'raffle_number' ? pad5(r[c]) : r[c])).join(';'))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `inscritas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    await audit('entries.exportCsv', { rows: all.length });
    setExporting(false);
    toast.success(`${all.length} inscrições exportadas.`);
  }

  const pages = Math.max(1, Math.ceil(total / size));

  return (
    <>
      <div className="head-row">
        <h1>Planilha de inscritas</h1>
        <button className="btn btn-ghost" onClick={exportCsv} disabled={exporting}>{exporting ? 'Exportando…' : 'Exportar CSV'}</button>
      </div>
      <div className="toolbar">
        <input className="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nome, nº, CPF, telefone, protocolo ou cidade" />
        <div className="seg small">
          {FILTERS.map(([v, l]) => <button key={v} className={filter === v ? 'on' : ''} onClick={() => { setFilter(v); setPage(0); }}>{l}</button>)}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
          <option value="recentes">Mais recentes</option><option value="antigas">Mais antigas</option>
          <option value="numero">Nº do sorteio</option><option value="nome">Nome A-Z</option>
        </select>
        <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} aria-label="Por página">
          {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </div>

      <div className="card table-card">
        <table className="sheet stack">
          <thead><tr><th>Nº sorteio</th><th>Participante</th><th>Contato</th><th>Gestação</th><th>Carteira</th><th>Situação</th><th>Inscrição</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-l="Nº sorteio" className="mono num">{pad5(r.raffle_number)}</td>
                <td data-l="Participante"><strong>{r.full_name}</strong><br /><span className="muted small">{maskCpf(r.cpf)} · {r.city}/{r.state}</span></td>
                <td data-l="Contato">{maskPhone(r.phone_fix || r.phone)}{r.email && <><br /><span className="muted small">{r.email}</span></>}</td>
                <td data-l="Gestação">{r.gestation_weeks} sem.{r.due_date && <><br /><span className="muted small">DPP {fmtDate(r.due_date)}</span></>}</td>
                <td data-l="Carteira">{r.formal_job ? 'Sim' : 'Não'}</td>
                <td data-l="Situação"><span className={`badge b-${r.status}`}>{STATUS_LABEL[r.status]}</span></td>
                <td data-l="Inscrição" className="small">{fmtDateTime(r.created_at)}</td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => setOpen(r)}>Abrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <p className="muted center pad">Nenhuma inscrição encontrada.</p>}
        {loading && <p className="muted center pad">Carregando…</p>}
      </div>
      <div className="pager">
        <span className="muted">{total.toLocaleString('pt-BR')} inscrições · página {page + 1} de {pages}</span>
        <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
        <button className="btn btn-sm btn-ghost" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Próxima</button>
      </div>

      {open && <EntryDialog entry={open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load(); }} />}
    </>
  );
}

function EntryDialog({ entry, onClose, onSaved }) {
  const [status, setStatus] = useState(entry.status);
  const [phoneFix, setPhoneFix] = useState(entry.phone_fix ? maskPhone(entry.phone_fix) : '');
  const [notes, setNotes] = useState(entry.notes || '');
  const [confirmDel, setConfirmDel] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from('entries').update({ status, phone_fix: onlyDigits(phoneFix) || null, notes: notes || null }).eq('id', entry.id);
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success('Inscrição atualizada.'); onSaved();
  }
  async function remove() {
    setBusy(true);
    const { error } = await supabase.from('entries').delete().eq('id', entry.id);
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success('Inscrição excluída.'); onSaved();
  }

  const info = [
    ['Nº do sorteio', pad5(entry.raffle_number)], ['Protocolo', entry.protocol], ['CPF', maskCpf(entry.cpf)],
    ['Telefone', maskPhone(entry.phone)], ['E-mail', entry.email || '—'], ['Cidade/UF', `${entry.city}/${entry.state}`],
    ['Idade gestacional', `${entry.gestation_weeks} semanas (~${Math.max(1, Math.round(entry.gestation_weeks / 4.345))} meses)`],
    ['DPP', fmtDate(entry.due_date)], ['Carteira assinada', entry.formal_job ? 'Sim' : 'Não'],
    ['Como conheceu', entry.discovery_source || '—'],
    ['Consentimentos', [entry.privacy_consent && 'regulamento', entry.marketing_consent && 'novidades', entry.whatsapp_confirmation_consent && 'confirmação WhatsApp'].filter(Boolean).join(', ') || '—'],
    ['Origem', entry.source || '—'], ['Inscrição', fmtDateTime(entry.created_at)],
  ];

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={`Ficha de ${entry.full_name}`}>
        <div className="head-row"><h2>{entry.full_name}</h2><button className="x" onClick={onClose} aria-label="Fechar">×</button></div>
        <dl className="kv">{info.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
        <div className="grid2">
          <label>Situação
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pendente">Pendente</option><option value="validada">Validada</option><option value="invalidada">Invalidada</option>
            </select>
          </label>
          <label>Telefone (correção)
            <input value={phoneFix} onChange={(e) => setPhoneFix(maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
          </label>
          <label className="full">Observações internas
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <div className="row-btns spread">
          {confirmDel ? (
            <span className="confirm">Excluir de vez? <button className="btn btn-sm btn-danger" onClick={remove} disabled={busy}>Sim, excluir</button> <button className="btn btn-sm btn-ghost" onClick={() => setConfirmDel(false)}>Cancelar</button></span>
          ) : <button className="btn btn-sm btn-ghost danger" onClick={() => setConfirmDel(true)}>Excluir</button>}
          <button className="btn" onClick={save} disabled={busy}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
