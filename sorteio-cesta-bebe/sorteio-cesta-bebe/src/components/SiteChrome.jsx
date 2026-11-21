import logo from '../assets/logo.svg';
import { Link, NavLink } from 'react-router-dom';
import { useSite } from '../lib/site.jsx';

export function Header() {
  const { settings } = useSite();
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <img src={logo} alt="" width="34" height="34" />
        <span>{settings.site_name || 'Sorteio Cesta Bebê'}</span>
      </Link>
      <nav>
        <NavLink to="/resultado">Resultado</NavLink>
        <Link to="/inscricao" className="btn btn-sm">Quero participar</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  const { settings } = useSite();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p><strong>{settings.site_name || 'Sorteio Cesta Bebê'}</strong></p>
        <p>Promoção de organizador independente, sem vínculo com a Caixa Econômica Federal.</p>
        <p className="muted">A Loteria Federal é usada apenas como base pública e transparente para a apuração do número sorteado.</p>
        <p className="muted">
          {settings.instagram && <>Instagram: <a href={`https://instagram.com/${settings.instagram.replace('@', '')}`}>@{settings.instagram.replace('@', '')}</a> · </>}
          {settings.contact_email && <>Contato: {settings.contact_email}</>}
        </p>
      </div>
    </footer>
  );
}

export default function SiteChrome({ children }) {
  return (
    <div className="site">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
