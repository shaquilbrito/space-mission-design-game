import { START } from "./sim.js";
const STARS = Array.from({ length: 40 }, (_, i) => [(i * 73) % 300, (i * 41) % 170, (i % 3) * .5 + .6]);
const clamp = (x) => Math.max(0, Math.min(1, x));
export default function Cam({ m, t, ph, s, targets, landable, zoom = 1 }) {
  const u = (a, b) => clamp((t - a) / (b - a)), stars = (op, dx = 0) => STARS.map(([x, y, r], i) => <circle key={i} cx={((x - dx) % 300 + 300) % 300} cy={y} r={r} fill="#fff" opacity={op} />);
  let label = "Câmara externa", body;
  if (ph <= 1) body = <><rect width="300" height="170" fill="#123a7a" />{stars(.3)}<rect y="125" width="300" height="45" fill="#2d4a2a" /><rect x="190" y="50" width="10" height="75" fill="#8899aa" /><rect x="188" y="70" width="30" height="4" fill="#8899aa" />
    <rect x="140" y="55" width="22" height="70" rx="8" fill="#f4f8ff" /><path d="M140 62 Q151 36 162 62Z" fill="#e0e8ff" /><rect x="140" y="105" width="22" height="6" fill="#d33" />{ph === 1 && <text x="20" y="40" fill="#ffc61a" fontSize="14">T-{Math.ceil(START[2] - t)} s</text>}</>;
  else if (ph <= 3) { const k = u(14, 28); label = ph === 2 ? "Câmara de bordo — subida" : "Saída da atmosfera";
    body = <><rect width="300" height="170" fill={`rgb(${20 - 17 * k},${60 - 52 * k},${140 - 115 * k})`} />{stars(k)}<circle cx="150" cy={430 + 40 * k} r="300" fill="#2a6fd0" /><circle cx="150" cy={430 + 40 * k} r="306" fill="none" stroke="#7fc4ff" strokeOpacity={.6 - .4 * k} strokeWidth="6" />
      {[0, 1, 2, 3].map(i => <ellipse key={i} cx={40 + i * 75} cy={(i * 47 + k * 400) % 170} rx="26" ry="7" fill="#fff" opacity={.8 * (1 - k)} />)}</>; }
  else if (ph === 4) { const k = u(28, 58); label = "Câmara de bordo — espaço"; body = <><rect width="300" height="170" fill="#02061a" />{stars(1, t * 6)}<circle cx="24" cy="130" r={Math.max(4, 36 * (1 - k))} fill="#2a6fd0" /><circle cx="240" cy="70" r={6 + 62 * k * k} fill={m.c} /></>; }
  else if (ph === 5) { const k = u(58, 64); label = "Câmara de bordo — chegada"; body = <><rect width="300" height="170" fill="#02061a" />{stars(.8)}<circle cx="150" cy={200 - 60 * k} r={90 + 90 * k} fill={m.c} /><circle cx="150" cy={200 - 60 * k} r={90 + 90 * k} fill="#000" opacity=".25" /></>; }
  else if (ph === 6) { const k = u(64, 72); label = landable ? "Câmara de bordo — aterragem" : "Câmara de bordo — inserção orbital";
    body = <><rect width="300" height="170" fill="#02061a" />{stars(.6)}{landable ? <><rect y={170 - 120 * k} width="300" height={170} fill={m.c} /><rect y={170 - 120 * k} width="300" height={170} fill="#000" opacity=".25" />{[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx={30 + i * 62} cy={170 - 120 * k + 30 + (i % 2) * 20} rx={4 + 14 * k} ry={2 + 7 * k} fill="#000" opacity=".35" />)}</> : <circle cx="150" cy={230 - 80 * k} r="130" fill={m.c} />}</>; }
  else { label = landable ? "Câmara do rover" : "Câmara da sonda";
    const pos = s.pos || { x: 300, y: 230 }, near = (targets || []).filter(x => !s.sam?.[x.g]).sort((a, b) => Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y))[0], d = near ? Math.hypot(near.x - pos.x, near.y - pos.y) : 999;
    const tx = near ? 150 + (near.x - pos.x) * .45 : -50, tr = Math.max(6, 34 - d / 12);
    body = landable ? <><rect width="300" height="170" fill="#0a1230" /><rect width="300" height="170" fill={m.c} opacity=".18" />{stars(.5)}<rect y="70" width="300" height="100" fill={m.c} /><rect y="70" width="300" height="100" fill="#000" opacity=".3" />
      {[0, 1, 2, 3, 4, 5].map(i => <ellipse key={i} cx={((i * 61 - pos.x * .5) % 320 + 320) % 320 - 10} cy={90 + (i * 29) % 70} rx="9" ry="4" fill="#000" opacity=".4" />)}
      {near && <g><circle cx={tx} cy={95 + Math.min(40, d / 8)} r={tr} fill="none" stroke="#27d3ff" strokeWidth="3" /><circle cx={tx} cy={95 + Math.min(40, d / 8)} r={tr / 3} fill="#27d3ff" /></g>}</>
      : <><rect width="300" height="170" fill="#02061a" />{stars(.6)}<circle cx="150" cy="190" r="150" fill={m.c} />{near && <circle cx={tx} cy="110" r={tr} fill="none" stroke="#27d3ff" strokeWidth="3" />}</>; }
  const w = 300 / zoom, h = 170 / zoom, x0 = (300 - w) / 2, y0 = (170 - h) / 2;
  return <svg viewBox={`${x0} ${y0} ${w} ${h}`} className="cam" role="img" aria-label={label}>{body}<text x={x0 + 6 / zoom} y={y0 + 14 / zoom} fill="#fff" fontSize={10 / zoom}>🔴 REC · {label}</text></svg>;
}
