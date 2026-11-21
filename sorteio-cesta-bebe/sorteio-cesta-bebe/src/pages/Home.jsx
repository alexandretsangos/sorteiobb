import SiteChrome from '../components/SiteChrome.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import PrizeArt from '../components/PrizeArt.jsx';
import { useSite } from '../lib/site.jsx';

const KITS = [
  { t: 'Kit lenço umedecido', d: 'Para as trocas do dia a dia.', c: '#EEF0E5' },
  { t: 'Pampers, fraldas e pomada Huggies', d: 'Fraldas e cuidado com a pele do bebê.', c: '#F1DDCF' },
  { t: 'Kit presente chá de bebê', d: 'Mimos para celebrar a chegada.', c: '#E5ECDF' },
  { t: 'Granado, cesta de cuidados maternidade', d: 'Cuidados para a mamãe e o bebê.', c: '#F6E7DC' },
];

export default function Home() {
  const { status, settings } = useSite();
  return (
    <SiteChrome>
      <section className="hero band">
        <div className="wrap hero-grid">
          <div className="hero-copy rise">
            <span className="pill">Edição especial para gestantes</span>
            <h1>{status?.title || 'SORTEIO de prêmios para o seu bebê.'}</h1>
            <p className="lead">{status?.subtitle || 'Preencha o cadastro gratuitamente, receba seu número na hora e concorra a uma ajudinha carinhosa para o começo dessa nova fase.'}</p>
            <div className="chips">
              <span className="chip">Prêmios para essa nova fase</span>
              <span className="chip">Resultado pela Loteria Federal</span>
            </div>
            <a href="#form-card" className="btn btn-lg">Quero meu número</a>
          </div>
          <div className="hero-art">
            <PrizeArt src={settings.hero_image_url || settings.prize_image_url || '/kit-maternidade.jpg'} />
          </div>
        </div>
      </section>

      <section className="band soft">
        <div className="wrap">
          <p className="kicker">Você pode ganhar</p>
          <h2>Kits para cuidar e celebrar</h2>
          <div className="kits">
            {KITS.map((k) => (
              <article key={k.t} className="kit" style={{ '--kit': k.c }}>
                <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="18" width="36" height="24" rx="6" fill="#5D785E" /><rect x="4" y="12" width="40" height="10" rx="4" fill="#A9B99B" /><rect x="21" y="12" width="6" height="30" fill="#F1DDCF" /><path d="M24 12c-4-8-12-6-10 0M24 12c4-8 12-6 10 0" stroke="#BD7058" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
                <h3>{k.t}</h3>
                <p>{k.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap form-grid">
          <div className="highlights">
            <div className="hl"><strong>Número exclusivo</strong><span>De 00000 a 99999, só seu.</span></div>
            <div className="hl"><strong>Uma ajudinha para o seu começo.</strong><span>Inscrição gratuita, sem compra.</span></div>
            <div className="hl"><strong>Sorteio transparente:</strong><span>Resultado pela Loteria Federal.</span></div>
          </div>
          <RegistrationForm />
        </div>
      </section>
    </SiteChrome>
  );
}
