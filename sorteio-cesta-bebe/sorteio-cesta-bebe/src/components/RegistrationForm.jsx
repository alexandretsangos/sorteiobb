import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, configured, errMsg } from '../lib/supabase.js';
import { useSite } from '../lib/site.jsx';
import { track } from '../lib/pixel.js';
import { pad5 } from '../lib/raffle.js';
import { maskCpf, maskPhone, maskDate, brDateToIso, validCpf, onlyDigits, UFS, DISCOVERY } from '../lib/format.js';
import { toast } from './Toast.jsx';

const EMPTY = {
  full_name: '', cpf: '', phone: '', email: '', city: '', state: '', gestation_weeks: '', due_date: '',
  formal_job: '', discovery_source: '', privacy_consent: false, marketing_consent: false,
};

function validate(f) {
  const e = {};
  if (f.full_name.trim().split(/\s+/).length < 2) e.full_name = 'Informe nome e sobrenome.';
  if (!validCpf(f.cpf)) e.cpf = 'CPF inválido.';
  if (onlyDigits(f.phone).length < 10) e.phone = 'Informe o WhatsApp com DDD.';
  if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'E-mail inválido.';
  if (!f.city.trim()) e.city = 'Informe a cidade.';
  if (!f.state) e.state = 'Escolha o estado.';
  const w = Number(f.gestation_weeks);
  if (!w || w < 1 || w > 45) e.gestation_weeks = 'De 1 a 45 semanas.';
  if (f.due_date && !brDateToIso(f.due_date)) e.due_date = 'Use dd/mm/aaaa.';
  if (f.formal_job === '') e.formal_job = 'Escolha uma opção.';
  if (!f.privacy_consent) e.privacy_consent = 'É preciso aceitar o regulamento.';
  return e;
}

export default function RegistrationForm() {
  const { status, settings, reload } = useSite();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const started = useRef(false);

  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };
  const onFirstTouch = () => {
    if (started.current) return;
    started.current = true;
    track('Lead');
    track('FormStart', {}, true);
  };

  const closed = status && (status.status !== 'open' || (status.registration_closes_at && new Date(status.registration_closes_at) < new Date()));

  async function submit(ev) {
    ev.preventDefault();
    const e = validate(f);
    setErrors(e);
    if (Object.keys(e).length) { toast.error('Confira os campos destacados.'); return; }
    if (!configured) { toast.error('Site sem conexão com o banco (configure o Supabase).'); return; }
    setSending(true);
    const payload = {
      ...f,
      cpf: onlyDigits(f.cpf),
      phone: onlyDigits(f.phone),
      due_date: brDateToIso(f.due_date),
      formal_job: f.formal_job === 'sim',
      whatsapp_confirmation_consent: true,
      source: document.referrer || 'acesso direto',
    };
    const { data, error } = await supabase.rpc('register_entry', { p: payload });
    setSending(false);
    if (error) { toast.error(errMsg(error)); if (/encerrad/i.test(error.message)) reload(); return; }
    setDone(data);
    if (!data.existing) {
      track('CompleteRegistration', { value: 1, currency: 'BRL' });
      track('InscricaoConcluida', { numero: pad5(data.raffle_number), protocolo: data.protocol }, true);
    }
    setTimeout(() => document.getElementById('form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  if (done) return <Success done={done} settings={settings} />;

  if (closed) {
    return (
      <div className="card form-card" id="form-card">
        <h2>Inscrições encerradas</h2>
        <p>Obrigada pelo carinho! As inscrições deste sorteio já foram encerradas.</p>
        <Link className="btn" to="/resultado">Consultar resultado e meu número</Link>
      </div>
    );
  }

  const field = (k) => ({ id: k, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `${k}-err` : undefined, onFocus: onFirstTouch });
  const Err = ({ k }) => (errors[k] ? <span className="err" id={`${k}-err`}>{errors[k]}</span> : null);

  return (
    <form className="card form-card" id="form-card" onSubmit={submit} noValidate>
      <div className="form-head">
        <span className="pill">Só para gestantes</span>
        <h2>Entre no sorteio</h2>
        <p className="muted">É rápido, gratuito e seguro. Preencha para garantir o seu número do sorteio.</p>
      </div>

      <div className="grid2">
        <label className="full">Nome completo
          <input {...field('full_name')} value={f.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Como no seu documento" autoComplete="name" />
          <Err k="full_name" />
        </label>
        <label>CPF
          <input {...field('cpf')} value={f.cpf} onChange={(e) => set('cpf', maskCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          <Err k="cpf" />
        </label>
        <label>WhatsApp com DDD
          <input {...field('phone')} value={f.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" autoComplete="tel" />
          <Err k="phone" />
        </label>
        <label className="full"><span>E-mail <span className="opt">(opcional)</span></span>
          <input {...field('email')} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="voce@email.com" autoComplete="email" />
          <Err k="email" />
        </label>
        <label>Cidade
          <input {...field('city')} value={f.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" />
          <Err k="city" />
        </label>
        <label>Estado
          <select {...field('state')} value={f.state} onChange={(e) => set('state', e.target.value)}>
            <option value="">UF</option>
            {UFS.map((u) => <option key={u}>{u}</option>)}
          </select>
          <Err k="state" />
        </label>
        <label>Semanas de gestação
          <input {...field('gestation_weeks')} value={f.gestation_weeks} onChange={(e) => set('gestation_weeks', onlyDigits(e.target.value).slice(0, 2))} placeholder="Ex.: 24" inputMode="numeric" />
          <Err k="gestation_weeks" />
        </label>
        <label><span>Data prevista do parto <span className="opt">(opcional)</span></span>
          <input {...field('due_date')} value={f.due_date} onChange={(e) => set('due_date', maskDate(e.target.value))} placeholder="dd/mm/aaaa" inputMode="numeric" />
          <Err k="due_date" />
        </label>
        <fieldset className="full">
          <legend>Trabalha de carteira assinada?</legend>
          <div className="seg">
            {['sim', 'nao'].map((v) => (
              <label key={v} className={f.formal_job === v ? 'on' : ''}>
                <input type="radio" name="formal_job" value={v} checked={f.formal_job === v} onChange={() => set('formal_job', v)} onFocus={onFirstTouch} />
                {v === 'sim' ? 'Sim' : 'Não'}
              </label>
            ))}
          </div>
          <Err k="formal_job" />
        </fieldset>
        <label className="full">Como conheceu o sorteio?
          <select {...field('discovery_source')} value={f.discovery_source} onChange={(e) => set('discovery_source', e.target.value)}>
            <option value="">Selecione</option>
            {DISCOVERY.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <label className="check">
        <input type="checkbox" checked={f.privacy_consent} onChange={(e) => set('privacy_consent', e.target.checked)} onFocus={onFirstTouch} />
        <span>Li e aceito o <Link to="/resultado#regulamento">regulamento</Link> e autorizo o uso dos meus dados para este sorteio.</span>
      </label>
      <Err k="privacy_consent" />
      <label className="check">
        <input type="checkbox" checked={f.marketing_consent} onChange={(e) => set('marketing_consent', e.target.checked)} />
        <span>Quero receber novidades no WhatsApp.</span>
      </label>

      <button className="btn btn-lg" disabled={sending}>{sending ? 'Enviando…' : 'Garantir meu número'}</button>
      <p className="tiny muted center">100% gratuito · número de 00000 a 99999 · resultado pela Loteria Federal</p>
    </form>
  );
}

function Success({ done, settings }) {
  const num = pad5(done.raffle_number);
  const copyText = `Meu número no sorteio: ${num} (protocolo ${done.protocol})`;
  const wa = onlyDigits(settings.whatsapp_number);
  const waMsg = `${settings.whatsapp_message || 'Olá! Fiz minha inscrição no sorteio.'} ${copyText}`;
  async function copy() {
    try { await navigator.clipboard.writeText(copyText); toast.success('Copiado!'); }
    catch { toast.info(copyText); }
  }
  return (
    <div className="card form-card success rise" id="form-card">
      <span className="pill">{done.existing ? 'Inscrição já existente' : 'Tudo certo'}</span>
      <h2>{done.existing ? 'Você já está participando!' : 'Inscrição confirmada!'}</h2>
      <p className="muted">Este é o seu número da sorte:</p>
      <div className="digits" aria-label={`Número ${num}`}>
        {num.split('').map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <p>Protocolo: <strong className="mono">{done.protocol}</strong></p>
      <p className="muted small">Guarde o protocolo: com ele você consulta seu número e o resultado.</p>
      <div className="row-btns">
        <button type="button" className="btn btn-ghost" onClick={copy}>Copiar número e protocolo</button>
        {wa && <a className="btn" href={`https://wa.me/55${wa.replace(/^55/, '')}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer">Falar no WhatsApp</a>}
      </div>
      <Link to="/resultado" className="link">Consultar resultado e meu número</Link>
    </div>
  );
}
