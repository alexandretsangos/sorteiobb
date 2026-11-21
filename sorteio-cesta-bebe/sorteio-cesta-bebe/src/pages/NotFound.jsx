import { Link } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome.jsx';

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="band">
        <div className="wrap narrow center">
          <h1>Página não encontrada</h1>
          <p className="lead">O endereço que você abriu não existe.</p>
          <Link className="btn" to="/">Voltar para o início</Link>
        </div>
      </section>
    </SiteChrome>
  );
}
