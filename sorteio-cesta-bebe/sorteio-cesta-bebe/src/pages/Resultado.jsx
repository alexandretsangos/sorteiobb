import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome.jsx';
import { useSite } from '../lib/site.jsx';
import { supabase, configured, errMsg } from '../lib/supabase.js';
import { pad5 } from '../lib/raffle.js';
import { fmtDate } from '../lib/format.js';

export default function Resultado() {
  const { status } = useSite();
  const loc = useLocation();
  const [prot, setProt] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const published = status?.status === 'published';
  const dez = status?.federal_dezenas || [];

  useEffect(() => {
    if (loc.hash === '#regulamento') setTimeout(() => document.getElementById('regulamento')?.scrollIntoView({ behavior: 'smooth' }), 200);
  }, [loc.hash, status]);

  async function lookup(e) {
    e.preventDefault();
    if (!prot.trim() || !configured) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('lookup_protocol', { p_protocol: prot.trim() });
    setBusy(false);
    setRes(error ? { error: errMsg(error) } : data);
  }

  return (
    <SiteChrome>
      <section className="band">
        <div className="wrap result-grid">
          <div className="card">
            <p className="kicker">Resultado</p>
            <h1>Loteria Federal</h1>
            {published ? (
              <p className="muted">Concurso {status.federal_concurso}{status.federal_data ? ` · ${fmtDate(status.federal_data)}` : ''}</p>
            ) : (
              <p className="muted">O resultado aparece aqui depois da apuração do concurso da Loteria Federal.</p>
            )}
            <ol className="dezenas">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i}><span>{i + 1}º prêmio</span><strong className="mono">{dez[i] || '------'}</strong></li>
              ))}
            </ol>
            <div className="drawn">
              <span>Número sorteado</span>
              <div className="digits">{pad5(published ? status.winning_number : null).split('').map((d, i) => <span key={i}>{d}</span>)}</div>
            </div>
          </div>

          <form className="card" onSubmit={lookup}>
            <p className="kicker">Meu número</p>
            <h2>Consultar inscrição</h2>
            <label>Digite o protocolo da sua inscrição
              <input value={prot} onChange={(e) => { setProt(e.target.value.toUpperCase()); setRes(null); }} placeholder="SB2026…" className="mono" />
            </label>
            <button className="btn" disabled={busy}>{busy ? 'Consultando…' : 'Consultar'}</button>
            {res && (
              <div className={`answer ${res.winner ? 'win' : ''}`} role="status">
                {res.error ? res.error
                  : !res.found ? `Não encontramos o protocolo ${prot}. Confira se digitou igual ao que recebeu.`
                  : res.winner ? <><strong>Parabéns, {res.first_name}!</strong> A organização vai falar com você pelo WhatsApp cadastrado.</>
                  : res.published ? <>Seu número é <strong className="mono">{pad5(res.raffle_number)}</strong>. Não foi desta vez, obrigada por participar!</>
                  : <>Seu número é <strong className="mono">{pad5(res.raffle_number)}</strong>. Número reservado. Aguarde o resultado da Loteria Federal.</>}
              </div>
            )}
          </form>

          <div className="card full" id="regulamento">
            <h2>Regulamento</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{status?.rules_notes || 'Carregando…'}</p>
            {status?.registration_closes_at && <p className="muted">Inscrições até {new Date(status.registration_closes_at).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}.</p>}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
