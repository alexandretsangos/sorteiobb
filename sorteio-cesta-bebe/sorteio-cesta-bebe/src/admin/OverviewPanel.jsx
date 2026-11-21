import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { pad5 } from '../lib/raffle.js';
import { fmtDateTime } from '../lib/format.js';
import LineChart from './LineChart.jsx';

const STATUS = { open: 'Inscrições abertas', closed: 'Inscrições encerradas', published: 'Resultado publicado' };
const count = (q) => q.then((r) => r.count || 0);

export default function OverviewPanel({ go }) {
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
      const start7 = new Date(startToday); start7.setDate(start7.getDate() - 6);
      const start30 = new Date(startToday); start30.setDate(start30.getDate() - 29);
      const base = () => supabase.from('entries').select('id', { count: 'exact', head: true });
      const [total, today, week, pend, val, inv, draw, last, recent] = await Promise.all([
        count(base()),
        count(base().gte('created_at', startToday.toISOString())),
        count(base().gte('created_at', start7.toISOString())),
        count(base().eq('status', 'pendente')),
        count(base().eq('status', 'validada')),
        count(base().eq('status', 'invalidada')),
        supabase.from('draws').select('*').eq('id', 1).single().then((r) => r.data),
        supabase.from('entries').select('full_name, raffle_number, city, state, created_at').order('created_at', { ascending: false }).limit(8).then((r) => r.data || []),
        fetchSince(start30),
      ]);
      const days = [];
      for (let i = 0; i < 30; i++) {
        const dt = new Date(start30); dt.setDate(dt.getDate() + i);
        days.push({ key: dt.toLocaleDateString('sv-SE'), label: dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), v: 0 });
      }
      const idx = Object.fromEntries(days.map((x, i) => [x.key, i]));
      recent.forEach((r) => { const k = new Date(r.created_at).toLocaleDateString('sv-SE'); if (k in idx) days[idx[k]].v++; });
      setD({ total, today, week, pend, val, inv, draw, last, days });
    })();
  }, []);

  if (!d) return <p className="muted">Carregando…</p>;
  return (
    <>
      <h1>Visão geral</h1>
      <div className="stats">
        <div className="stat"><span>Inscritas</span><strong>{d.total.toLocaleString('pt-BR')}</strong><small>{d.today} hoje · {d.week} nos últimos 7 dias</small></div>
        <div className="stat"><span>Pendentes de verificação</span><strong>{d.pend.toLocaleString('pt-BR')}</strong><small><button className="link" onClick={() => go('planilha')}>Abrir planilha</button></small></div>
        <div className="stat"><span>Validadas</span><strong>{d.val.toLocaleString('pt-BR')}</strong><small>{d.inv} invalidadas</small></div>
        <div className="stat"><span>Número sorteado</span><strong className="mono">{pad5(d.draw?.winning_number)}</strong><small>{d.draw?.status === 'published' ? 'publicado' : 'ainda não publicado'}</small></div>
      </div>
      <div className="panel-grid">
        <div className="card">
          <h2>Inscrições por dia</h2>
          <LineChart data={d.days} />
        </div>
        <div className="card">
          <h2>Situação do sorteio</h2>
          <dl className="kv">
            <dt>Status</dt><dd>{STATUS[d.draw?.status] || '—'}</dd>
            <dt>Concurso</dt><dd>{d.draw?.federal_concurso || 'não definido'}</dd>
            <dt>Última sincronização</dt><dd>{fmtDateTime(d.draw?.synced_at)}</dd>
            <dt>Publicação automática</dt><dd>{d.draw?.auto_publish ? 'ligada (manhã e noite)' : 'desligada'}</dd>
            <dt>Encerramento</dt><dd>{fmtDateTime(d.draw?.registration_closes_at)}</dd>
          </dl>
          <button className="btn btn-ghost btn-sm" onClick={() => go('sorteio')}>Abrir sorteio</button>
        </div>
      </div>
      <div className="card">
        <h2>Últimas inscrições</h2>
        {d.last.length === 0 ? <p className="muted">Nenhuma inscrição ainda.</p> : (
          <ul className="recent">
            {d.last.map((e, i) => (
              <li key={i}><span className="mono num">{pad5(e.raffle_number)}</span><span>{e.full_name}</span><span className="muted">{e.city}/{e.state}</span><span className="muted">{fmtDateTime(e.created_at)}</span></li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

async function fetchSince(since) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('entries').select('created_at').gte('created_at', since.toISOString()).range(from, from + 999);
    if (!data?.length) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}
