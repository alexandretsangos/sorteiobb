import { useEffect, useState } from 'react';

let push = () => {};
export const toast = {
  success: (m) => push({ m, t: 'ok' }),
  error: (m) => push({ m, t: 'err' }),
  info: (m) => push({ m, t: 'info' }),
};

export function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    push = (it) => {
      const id = Math.random();
      setItems((x) => [...x, { ...it, id }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4200);
    };
  }, []);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((i) => <div key={i.id} className={`toast toast-${i.t}`}>{i.m}</div>)}
    </div>
  );
}
