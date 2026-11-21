// Ilustração padrão do kit (usada enquanto não há foto real configurada no painel).
// Cesta de vime com ursinho, fraldas, lenços, lata de fórmula, mamadeira, hidratante, manta e laço.
export default function PrizeArt({ src }) {
  if (src) return <img className="prize-photo" src={src} alt="Kit de produtos do sorteio" />;
  const wicker = [];
  for (let r = 0; r < 5; r++) {
    const y = 262 + r * 22;
    const inset = r * 5;
    for (let c = 0; c < 13; c++) {
      const x = 96 + inset + c * ((288 - inset * 2) / 13);
      const w = (288 - inset * 2) / 13 - 3;
      wicker.push(<rect key={`${r}-${c}`} x={x} y={y + ((c + r) % 2 ? 2 : 0)} width={w} height="18" rx="5" fill={(c + r) % 2 ? '#C9A27E' : '#D8B690'} />);
    }
  }
  return (
    <svg className="prize-art" viewBox="0 0 480 440" role="img" aria-label="Cesta de vime com kit de produtos para bebê: ursinho, fraldas, lenços, fórmula, mamadeira, hidratante e manta">
      <defs>
        <radialGradient id="pa-bg" cx=".5" cy=".45" r=".6"><stop offset="0" stopColor="#F6F1E6" /><stop offset="1" stopColor="#E3E9DA" /></radialGradient>
        <linearGradient id="pa-can" x1="0" x2="1"><stop offset="0" stopColor="#E9E4DA" /><stop offset=".45" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D9D2C4" /></linearGradient>
        <linearGradient id="pa-bottle" x1="0" x2="1"><stop offset="0" stopColor="#F4EEE6" /><stop offset=".5" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E6DED2" /></linearGradient>
        <linearGradient id="pa-bear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9B48F" /><stop offset="1" stopColor="#C49A72" /></linearGradient>
        <linearGradient id="pa-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B8875E" /><stop offset="1" stopColor="#9A6C47" /></linearGradient>
      </defs>

      <circle cx="240" cy="212" r="204" fill="url(#pa-bg)" />
      <ellipse cx="240" cy="404" rx="176" ry="14" fill="#26372D" opacity=".09" />

      {/* alça da cesta (atrás) */}
      <path d="M118 252 C118 92 362 92 362 252" fill="none" stroke="#B8875E" strokeWidth="14" strokeLinecap="round" />
      <path d="M118 252 C118 92 362 92 362 252" fill="none" stroke="#D8B690" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 9" />

      {/* manta dobrada (fundo direito) */}
      <g transform="rotate(-8 360 190)">
        <rect x="308" y="150" width="104" height="34" rx="16" fill="#E7C7B6" />
        <rect x="304" y="178" width="110" height="34" rx="16" fill="#F1DDCF" />
        <rect x="308" y="206" width="104" height="34" rx="16" fill="#E7C7B6" />
        <path d="M318 166h84M316 194h90M318 222h84" stroke="#FAF7EF" strokeWidth="2" strokeDasharray="4 6" opacity=".8" />
      </g>

      {/* ursinho */}
      <g>
        <circle cx="198" cy="92" r="20" fill="url(#pa-bear)" /><circle cx="198" cy="92" r="10" fill="#F1DDCF" />
        <circle cx="282" cy="92" r="20" fill="url(#pa-bear)" /><circle cx="282" cy="92" r="10" fill="#F1DDCF" />
        <ellipse cx="240" cy="214" rx="58" ry="54" fill="url(#pa-bear)" />
        <circle cx="240" cy="128" r="50" fill="url(#pa-bear)" />
        <ellipse cx="240" cy="146" rx="24" ry="18" fill="#F3E3D3" />
        <ellipse cx="240" cy="138" rx="8" ry="6" fill="#4A3426" />
        <path d="M240 144v8M232 154q8 6 16 0" stroke="#4A3426" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="222" cy="120" r="5" fill="#2B2420" /><circle cx="258" cy="120" r="5" fill="#2B2420" />
        <circle cx="224" cy="118" r="1.6" fill="#fff" /><circle cx="260" cy="118" r="1.6" fill="#fff" />
        <circle cx="212" cy="140" r="6" fill="#E7A58E" opacity=".45" /><circle cx="268" cy="140" r="6" fill="#E7A58E" opacity=".45" />
        <path d="M218 172 l22 10 22 -10 -6 16 -16 -6 -16 6z" fill="#BD7058" />
        <circle cx="240" cy="181" r="5" fill="#8A503E" />
      </g>

      {/* hidratante com pump (esquerda) */}
      <g transform="rotate(-6 132 200)">
        <rect x="126" y="112" width="12" height="20" rx="3" fill="#FAF7EF" stroke="#DED9C9" strokeWidth="2" />
        <path d="M132 112v-8h18" stroke="#DED9C9" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="108" y="130" width="48" height="130" rx="18" fill="url(#pa-bottle)" stroke="#E2D9CC" strokeWidth="2" />
        <rect x="114" y="168" width="36" height="52" rx="8" fill="#F9E4D8" />
        <circle cx="132" cy="184" r="8" fill="#BD7058" opacity=".7" />
        <path d="M121 202h22M124 211h16" stroke="#8A503E" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      </g>

      {/* lata de fórmula (direita) */}
      <g>
        <rect x="292" y="148" width="72" height="104" rx="6" fill="url(#pa-can)" />
        <ellipse cx="328" cy="148" rx="36" ry="9" fill="#C9C1B2" />
        <ellipse cx="328" cy="146" rx="36" ry="9" fill="#ECE7DE" />
        <rect x="292" y="160" width="72" height="40" fill="#5D785E" />
        <rect x="292" y="160" width="72" height="5" fill="#A9B99B" />
        <text x="328" y="187" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="14" fill="#FAF7EF">Fórmula</text>
      </g>

      {/* mamadeira (direita, à frente da lata) */}
      <g transform="rotate(8 386 200)">
        <path d="M378 110 q8 -18 16 0 v8 h-16z" fill="#E7C7B6" />
        <rect x="370" y="116" width="32" height="14" rx="4" fill="#A9B99B" />
        <rect x="368" y="128" width="36" height="122" rx="14" fill="url(#pa-bottle)" stroke="#E2D9CC" strokeWidth="2" opacity=".96" />
        <path d="M374 160h10M374 180h14M374 200h10M374 220h14" stroke="#A9B99B" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="374" y="208" width="24" height="38" rx="9" fill="#F3EDE3" />
      </g>

      {/* pacote de fraldas (frente esquerda) */}
      <g transform="translate(0 -24) rotate(-7 190 220)">
        <rect x="142" y="168" width="96" height="104" rx="12" fill="#7FA0B5" />
        <rect x="142" y="168" width="96" height="104" rx="12" fill="#A9C4D4" />
        <path d="M142 218 q48 -20 96 0 v24 a12 12 0 0 1 -12 12 h-72 a12 12 0 0 1 -12 -12z" fill="#8FB0C4" />
        <circle cx="190" cy="204" r="20" fill="#FAF7EF" />
        <circle cx="183" cy="200" r="2.6" fill="#26372D" /><circle cx="197" cy="200" r="2.6" fill="#26372D" />
        <path d="M184 210 q6 5 12 0" stroke="#BD7058" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text x="190" y="234" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="15" fill="#FAF7EF">Fraldas</text>
      </g>

      {/* pacote de lenços (frente centro-direita) */}
      <g transform="translate(0 -26) rotate(4 280 246)">
        <rect x="232" y="222" width="104" height="48" rx="14" fill="#FAF7EF" stroke="#DED9C9" strokeWidth="2" />
        <rect x="256" y="230" width="56" height="18" rx="9" fill="#E7C7B6" />
        <text x="284" y="262" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="13" fill="#8A503E">lenços</text>
      </g>

      {/* corpo da cesta: vime */}
      <path d="M92 256 h296 l-26 128 a16 16 0 0 1 -16 13 H134 a16 16 0 0 1 -16 -13z" fill="#B8875E" />
      <clipPath id="pa-clip"><path d="M92 256 h296 l-26 128 a16 16 0 0 1 -16 13 H134 a16 16 0 0 1 -16 -13z" /></clipPath>
      <g clipPath="url(#pa-clip)">{wicker}</g>
      {/* borda trançada */}
      <rect x="82" y="244" width="316" height="22" rx="11" fill="url(#pa-rim)" />
      <path d="M92 255 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t16 0" stroke="#D8B690" strokeWidth="3" fill="none" opacity=".8" />

      {/* laço */}
      <g>
        <path d="M240 272 C204 244 178 252 182 274 C186 296 214 292 240 272z" fill="#5D785E" />
        <path d="M240 272 C276 244 302 252 298 274 C294 296 266 292 240 272z" fill="#5D785E" />
        <path d="M240 272 C214 260 196 264 198 274 C214 278 228 276 240 272z" fill="#2F4735" opacity=".35" />
        <path d="M240 272 C266 260 284 264 282 274 C266 278 252 276 240 272z" fill="#2F4735" opacity=".35" />
        <path d="M234 278 l-22 54 14 -4 8 12 10 -58z" fill="#4C6650" />
        <path d="M246 278 l22 54 -14 -4 -8 12 -10 -58z" fill="#4C6650" />
        <ellipse cx="240" cy="273" rx="13" ry="11" fill="#2F4735" />
      </g>

      {/* brilhos e coração */}
      <path d="M418 90l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="#BD7058" />
      <path d="M62 150l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#A9B99B" />
      <path d="M86 70c-6-8-18-2-12 8l12 12 12-12c6-10-6-16-12-8z" fill="#E7C7B6" />
    </svg>
  );
}
