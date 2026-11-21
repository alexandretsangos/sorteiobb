// Regras de apuração — usadas no painel e na função da Vercel.
export const pad5 = (n) => (n === null || n === undefined || n === '' ? '-----' : String(n).padStart(5, '0'));

export function cleanDezenas(list) {
  return (list || []).map((d) => String(d).replace(/\D/g, '')).filter(Boolean).slice(0, 5);
}

// soma_modulo: soma dos 4 últimos dígitos de cada uma das 5 dezenas, mantém os 5 últimos dígitos (módulo 100.000).
// primeira_dezena: usa só o 1º prêmio (5 últimos dígitos).
export function computeWinning(dezenas, mode = 'soma_modulo') {
  const d = cleanDezenas(dezenas);
  if (mode === 'primeira_dezena') {
    if (!d.length) return null;
    return Number(d[0].slice(-5)) % 100000;
  }
  if (d.length < 5) return null;
  const total = d.reduce((s, x) => s + Number(x.slice(-4)), 0);
  return total % 100000;
}
