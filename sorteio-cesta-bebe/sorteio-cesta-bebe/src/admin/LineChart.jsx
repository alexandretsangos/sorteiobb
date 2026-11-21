import { useEffect, useRef, useState } from 'react';

export default function LineChart({ data }) {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState(null);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const H = 220, pl = 34, pr = 10, pt = 14, pb = 26;
  const max = Math.max(4, ...data.map((d) => d.v));
  const nice = Math.ceil(max / 4) * 4;
  const x = (i) => pl + (i * (w - pl - pr)) / Math.max(1, data.length - 1);
  const y = (v) => pt + (1 - v / nice) * (H - pt - pb);
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join('');
  const area = `${path}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const every = w < 520 ? 7 : 5;
  return (
    <div className="chart" ref={ref}>
      <svg width={w} height={H} onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.clientX - r.left - pl) / (w - pl - pr)) * (data.length - 1)); setHover(Math.max(0, Math.min(data.length - 1, i))); }}>
        {[0, 1, 2, 3, 4].map((k) => { const v = (nice / 4) * k; return (
          <g key={k}><line x1={pl} x2={w - pr} y1={y(v)} y2={y(v)} stroke="var(--line)" /><text x={pl - 6} y={y(v) + 4} textAnchor="end" className="axis">{v}</text></g>
        ); })}
        <path d={area} fill="var(--primary)" opacity=".12" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => ((i % every === 0 && data.length - 1 - i >= every / 2) || i === data.length - 1) && <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="axis">{d.label}</text>)}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={y(0)} stroke="var(--ink)" opacity=".25" />
            <circle cx={x(hover)} cy={y(data[hover].v)} r="5" fill="var(--primary)" stroke="var(--card)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="tip" style={{ left: Math.min(Math.max(x(hover), 60), w - 60) }}>{data[hover].label}: <strong>{data[hover].v}</strong></div>
      )}
    </div>
  );
}
