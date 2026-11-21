import { useNavigate, useLocation } from 'react-router-dom';

const LINKS = [['/', 'Site'], ['/inscricao', 'Inscrição'], ['/resultado', 'Resultado'], ['/admin', 'Painel']];

export default function DemoBar() {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <div className="demobar" role="navigation" aria-label="Prévia">
      <span>Prévia com dados de exemplo</span>
      <div>
        {LINKS.map(([to, l]) => (
          <button key={to} className={loc.pathname === to ? 'on' : ''} onClick={() => { nav(to); window.scrollTo(0, 0); }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
