import { useEffect, useRef } from "react";
import { GOALS } from "./catalog.js";
const ROCKS = Array.from({ length: 16 }, (_, i) => [(i * 97 + 30) % 580, (i * 61 + 20) % 240, 4 + (i % 4) * 3]);
export default function Ops({ s, m, targets, landable, icon, state, onInput, onEnd, canEnd, locked }) {
  const keys = useRef({}), last = useRef("");
  const send = () => { const k = keys.current, v = { dx: (k.r ? 1 : 0) - (k.l ? 1 : 0), dy: (k.d ? 1 : 0) - (k.u ? 1 : 0), col: !!k.c }, j = JSON.stringify(v); if (j !== last.current) { last.current = j; onInput(v); } };
  useEffect(() => {
    const M = { ArrowLeft: "l", a: "l", ArrowRight: "r", d: "r", ArrowUp: "u", w: "u", ArrowDown: "d", s: "d", e: "c", " ": "c" };
    const h = (down) => (ev) => { const k = M[ev.key.length === 1 ? ev.key.toLowerCase() : ev.key]; if (k && !locked) { keys.current[k] = down; ev.preventDefault(); send(); } };
    const dn = h(true), up = h(false); window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [locked]);
  const hold = (k) => ({ onPointerDown: () => { keys.current[k] = true; send(); }, onPointerUp: () => { keys.current[k] = false; send(); }, onPointerLeave: () => { keys.current[k] = false; send(); } });
  const pos = s.pos || { x: 300, y: 230 }, done = targets.filter(t => state(t.g) === "done").length, open = targets.filter(t => state(t.g) === "pending").length;
  return <div>
    <div className="row card" style={{ padding: 8 }}><b>{landable ? `${icon} Move o rover e colecta amostras` : `${icon} Move a sonda sobre os alvos`}</b><span>🗄️ {(s.gb || 0).toFixed(1)} GB</span><span>⚡ {Math.round(s.res.e)}%</span><span>✔ {done}/{targets.length}</span></div>
    <svg viewBox="0 0 600 260" className="scene" role="img" aria-label="Superfície do planeta">
      {landable ? <><rect width="600" height="260" fill={m.c} /><rect width="600" height="260" fill="#000" opacity=".3" />{ROCKS.map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r} fill="#000" opacity=".3" />)}</>
        : <><rect width="600" height="260" fill="#02061a" /><circle cx="300" cy="140" r="210" fill={m.c} opacity=".55" />{[60, 120, 180].map(y => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#27d3ff" strokeOpacity=".15" />)}</>}
      {targets.map(t => { const st = state(t.g); return <g key={t.g} opacity={st === "locked" ? .35 : 1}><circle cx={t.x} cy={t.y} r="26" fill="none" stroke={st === "done" ? "#22e07a" : "#27d3ff"} strokeWidth="3" strokeDasharray={st === "done" ? "0" : "6 4"} /><text x={t.x} y={t.y + 6} textAnchor="middle" fontSize="18">{st === "done" ? "✅" : st === "locked" ? "🚫" : "🔬"}</text><text x={t.x} y={t.y + 42} textAnchor="middle" fontSize="10" fill="#fff">{GOALS[t.g].split(" ").slice(0, 3).join(" ")}</text></g>; })}
      {s.prog > 0 && <circle cx={pos.x} cy={pos.y} r={30} fill="none" stroke="#ffc61a" strokeWidth="4" strokeDasharray={`${s.prog * 188} 188`} />}
      <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize="30">{icon}</text>
    </svg>
    <div className="row" style={{ marginTop: 8 }}><small>{locked ? "Aguarda… (modo espectador / pausa)" : "Setas ou WASD para mover · E ou Espaço para colectar"}</small>
      <span className="dpad"><button className="btn" {...hold("l")}>◀</button><button className="btn" {...hold("u")}>▲</button><button className="btn" {...hold("d")}>▼</button><button className="btn" {...hold("r")}>▶</button><button className="btn gold" {...hold("c")}>Colectar</button></span>
      {canEnd && <button className="btn blue" onClick={onEnd} disabled={!done && s.res.e > 0}>Concluir operações</button>}</div>
    {open === 0 && <p className="ok">Todas as amostras possíveis foram colectadas. A concluir…</p>}
  </div>;
}
