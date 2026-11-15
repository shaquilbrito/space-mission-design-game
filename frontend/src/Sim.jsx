import { useRef, useState, useEffect } from "react";
import { calc } from "./Wizard.jsx";
import { ASTRONAUTS, GOALS } from "./catalog.js";
import { PHASES, TOTAL, START, phaseAt, TRIP, RISK, makeEvents, apply, finish, fmtT, LAND, targets as mkTargets } from "./sim.js";
import { sfx } from "./audio.js";
import Cam from "./Cam.jsx";
import Ops from "./Ops.jsx";

const RESN = [["e", "⚡ Energia"], ["c", "📡 Comunicação"], ["a", "🗄️ Armazenamento"], ["s", "🍎 Suprimentos"]];
const B = (u, a, b, c) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
const QL = { good: "Resultado óptimo", mid: "Resultado parcial", bad: "Resultado mau" };
const cl = (x) => Math.max(-1, Math.min(1, x));
const pack = (s) => ({ t: s.t, ph: s.ph, log: s.log.slice(-30), res: s.res, hp: s.hp, done: s.done, failed: s.failed, sam: s.sam, gb: s.gb, pos: s.pos, prog: s.prog, ops: s.ops, opsDone: s.opsDone, dec: s.dec,
  pending: s.pending && { id: s.pending.id, t: s.pending.t, d: s.pending.d, icon: s.pending.icon, expl: s.pending.expl, opts: s.pending.opts } });

export default function Sim({ m, cfg, onDone, mp }) {
  const guest = !!mp && !mp.host, r = calc(m, cfg), astro = ASTRONAUTS.find(a => a.id === cfg.astro) || ASTRONAUTS[0], landable = LAND.includes(m.id), T = mkTargets(m);
  const icon = landable ? (r.ship.type === "crew" ? "🧑‍🚀" : "🤖") : "🛰️";
  const S = useRef(null);
  if (!S.current) S.current = { t: 0, ph: -1, log: [], sched: makeEvents(m, cfg, r), nextEv: 0, pending: null, done: false, failed: null, discovery: 0, dec: [], evlog: [], ops: false, opsDone: false, pos: { x: 300, y: 230 }, prog: 0, gb: 0, sam: {},
    hp: Object.fromEntries(r.ins.map(i => [i.id, 100])), res: { e: cfg.res.e * 20, c: cfg.res.c * 20, a: cfg.res.a * 20, s: cfg.res.s * 20 } };
  const [snap, setSnap] = useState(null), [, bump] = useState(0), [speed, setSpeed] = useState(2), [paused, setPaused] = useState(false), [modal, setModal] = useState(false), [snd, setSnd] = useState(true), [fb, setFb] = useState(""), [zoom, setZoom] = useState(1);
  const real = S.current, s = guest ? { ...real, ...(snap || {}) } : real, inp = useRef({ dx: 0, dy: 0, col: false }), rem = useRef({ dx: 0, dy: 0, col: false }), last = useRef(0);
  const send = () => { if (mp?.host && Date.now() - last.current > 120) { last.current = Date.now(); mp.socket.emit("sim_state", pack(real)); } };
  const add = (x, icon = "✔") => real.log.push([fmtT(real.t, m), x, icon]);
  const tstate = (g) => real.sam[g] ? "done" : r.ins.some(i => i.goals.includes(g) && real.hp[i.id] >= 50) ? "pending" : "locked";
  const gstate = (g) => s.sam?.[g] ? "done" : r.ins.some(i => i.goals.includes(g) && s.hp[i.id] >= 50) ? "pending" : "locked";
  const enter = (i) => {
    add(PHASES[i][1], i === 0 ? "ℹ" : "✔");
    if (snd && i === 1) sfx("count"); if (snd && i === 2) sfx("launch");
    if (i === 6) { const mar = Math.min(1, (r.power - r.use) / r.power / .3); if (Math.random() < RISK[m.id] * (1 - .5 * mar)) { real.failed = "Falha crítica durante a aterragem / inserção orbital"; add("Falha crítica na aterragem!", "✖"); } }
    if (i === 7 && !real.failed) { real.ops = true; add(landable ? "Aterragem concluída. Rover pronto para investigar." : "Em órbita. Sonda pronta para investigar."); }
  };
  const decide = (o) => { const ev = real.pending; apply(real, ev, o[1]); add(`Decisão: ${o[0]} — ${QL[o[1]]}.`, o[1] === "good" ? "✔" : o[1] === "mid" ? "ℹ" : "⚠"); real.pending = null; setModal(false); setFb(QL[o[1]]); snd && sfx("ok"); send(); };
  const endOps = () => { if (real.opsDone) return; real.opsDone = true; real.t = START[8]; add("Operações científicas concluídas."); send(); };

  useEffect(() => {                                   // relógio da missão (só o anfitrião / modo solo)
    if (guest) return;
    const id = setInterval(() => {
      if (paused || real.pending || real.done) return;
      if (!real.ops || real.opsDone) real.t = Math.min(real.opsDone ? TOTAL : START[7], real.t + .1 * speed);
      const p = phaseAt(real.t); while (real.ph < p) { real.ph++; enter(real.ph); }
      if (real.nextEv < real.sched.length && real.t >= real.sched[real.nextEv].at && !real.failed) { real.pending = real.sched[real.nextEv++]; add(real.pending.t + " detectado.", "⚠"); snd && sfx("alert"); mp && mp.socket.emit("ev_open", {}); }
      if (real.t >= TOTAL || (real.failed && real.t >= START[7])) { real.done = true; add(real.failed ? "Missão perdida." : "Missão concluída."); setTimeout(() => onDone(finish(real, m, cfg, r)), 1500); }
      bump(x => x + 1); send();
    }, 100);
    return () => clearInterval(id);
  }, [paused, speed, snd]);
  useEffect(() => {                                   // operações no solo: rover / sonda
    if (guest) return;
    const id = setInterval(() => {
      if (!real.ops || real.opsDone || real.done || paused || real.pending) return;
      const k = inp.current, q = rem.current, dx = cl(k.dx + q.dx), dy = cl(k.dy + q.dy), col = k.col || q.col;
      if ((dx || dy) && real.res.e > 0) { real.pos.x = Math.max(14, Math.min(586, real.pos.x + dx * 3.4)); real.pos.y = Math.max(14, Math.min(246, real.pos.y + dy * 3.4)); real.res.e = Math.max(0, real.res.e - .03); }
      const tg = T.find(t => tstate(t.g) === "pending" && Math.hypot(t.x - real.pos.x, t.y - real.pos.y) < 36);
      if (col && tg && real.res.e > 0) {
        real.prog = Math.min(1, real.prog + .025);
        if (real.prog >= 1) { const ins = r.ins.find(i => i.goals.includes(tg.g) && real.hp[i.id] >= 50); real.sam[tg.g] = true; real.gb += ins.data * 2; real.res.e = Math.max(0, real.res.e - 1.5); real.prog = 0;
          const n = T.filter(x => real.sam[x.g]).length, tot = T.filter(x => real.sam[x.g] || tstate(x.g) !== "locked").length;
          real.t = Math.min(START[8] - .01, START[7] + 20 * n / Math.max(1, tot)); add(`${ins.name}: ${GOALS[tg.g]} (${(ins.data * 2).toFixed(1)} GB).`); snd && sfx("ok"); }
      } else real.prog = 0;
      if (!T.some(x => tstate(x.g) === "pending") && !real.endT) real.endT = setTimeout(endOps, 1500);
      bump(x => x + 1); send();
    }, 50);
    return () => clearInterval(id);
  }, [paused, snd]);
  useEffect(() => {
    if (!mp) return;
    const so = mp.socket, hs = (d) => setSnap(d), hr = (idx) => { if (real.pending) decide(real.pending.opts[Math.min(2, idx)]); }, hi = (d) => { rem.current = d; };
    if (guest) so.on("sim_state", hs); else { so.on("ev_result", hr); so.on("sim_input", hi); }
    return () => { so.off("sim_state", hs); so.off("ev_result", hr); so.off("sim_input", hi); };
  }, []);

  const t = s.t, ph = Math.max(0, phaseAt(t)), frac = Math.max(0, Math.min(1, (t - START[2]) / (START[6] - START[2])));
  let x = 80, y = 130, rot = -45, flame = false;
  if (t >= START[2] && t < START[4]) { const u = (t - START[2]) / 14; x = 80 + u * 10; y = 130 - u * 80; rot = -45 + u * 15; flame = true; }
  else if (t >= START[4] && t < START[5]) { const u = (t - START[4]) / 30; x = B(u, 95, 290, 455); y = B(u, 50, -30, 115); rot = -10 + u * 40; flame = u < .1 || u > .9; }
  else if (t >= START[5] && t < START[6]) { const u = (t - START[5]) / 6; x = 455 + u * 40; y = 115 + u * 5; rot = 30; }
  else if (t >= START[6]) { x = 505; y = 85; rot = 45; }
  const ev = s.pending, score = Math.round(t / TOTAL * r.got * 600 + (s.dec || []).reduce((a, b) => a + b, 0) * 500), inOps = s.ops && !s.opsDone && ph >= 7;
  const vote = (o, i) => mp ? mp.socket.emit("ev_vote", { idx: i }) : decide(o), nv = mp ? Object.keys(mp.room.evvotes || {}).length : 0;
  const onInput = (v) => guest ? mp.socket.emit("sim_input", v) : (inp.current = v);
  return <div className="page wiz">
    <h2 className="stitle">Etapa 7: Simulação da Missão</h2>
    <div className="simgrid">
      <div className="simcol">
        <div className="card"><h4>⚙️ Configuração</h4><p>🚀 {r.rocket.name}</p><p>🪐 {r.orbit.name.split("(")[0]}</p><p>⏱ {TRIP[m.id][0]} dias (ilustrativo)</p></div>
        <div className="card"><h4>📦 Recursos</h4>{RESN.map(([k, n]) => <div key={k}><small>{n} {Math.round(s.res[k])}%</small><div className="bar"><i style={{ width: s.res[k] + "%", background: s.res[k] < 30 ? "var(--bad)" : undefined }} /></div></div>)}</div>
        <div className="card"><h4>🏁 Fase da Missão</h4>{PHASES.map((p, i) => <div key={p[0]} className={i === ph ? "gold" : i < ph ? "ok" : "lock"}>{i < ph ? "✔" : i === ph ? "●" : "○"} {p[1]}</div>)}</div>
      </div>
      <div className="simmid">
        <div className="row card" style={{ padding: 8 }}><span>{s.done ? "⏹ Concluída" : paused ? "⏸ Em pausa" : "🔴 Em andamento"}</span>
          <button className="btn" disabled={guest} onClick={() => setPaused(!paused)}>{paused ? "▶" : "⏸"}</button>
          <span>{[1, 2, 5, 10].map(v => <button key={v} disabled={guest} className={"btn" + (speed === v ? " blue" : "")} onClick={() => setSpeed(v)}>{v}×</button>)}</span>
          <button className="btn" onClick={() => setSnd(!snd)}>{snd ? "🔊" : "🔇"}</button><span className="card" style={{ padding: "4px 10px" }}>🕒 {fmtT(t, m)}</span></div>
        {inOps ? <Ops s={s} m={m} targets={T} landable={landable} icon={icon} state={gstate} onInput={onInput} onEnd={endOps} canEnd={!guest} locked={paused || !!ev} /> : <>
          <svg viewBox="0 0 600 300" className="scene" role="img" aria-label="Viagem espacial animada">
            <defs><radialGradient id="ge" cx="50%" cy="30%"><stop offset="0" stopColor="#5db0ff" /><stop offset="1" stopColor="#0b2d7a" /></radialGradient><radialGradient id="gp" cx="35%" cy="30%"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor={m.c} /></radialGradient></defs>
            <circle cx="70" cy="250" r="115" fill="url(#ge)" /><text x="70" y="285" fontSize="11" fill="#fff" textAnchor="middle">TERRA</text><circle cx="520" cy="130" r="55" fill="url(#gp)" /><text x="520" y="205" fontSize="11" fill="#fff" textAnchor="middle">{m.name.split(" ").slice(-1)[0].toUpperCase()}</text>
            <path d="M95 50 Q290 -30 455 115" fill="none" stroke="#27d3ff" strokeDasharray="6 6" strokeOpacity=".5" />
            {flame && <circle cx={x - 14} cy={y + 14} r="7" fill="#ffb020" opacity=".9" />}
            <text x={x} y={y} fontSize="34" textAnchor="middle" transform={`rotate(${rot} ${x} ${y})`}>🚀</text>
            {ph === 1 && <text x="300" y="150" fontSize="80" fill="#ffc61a" textAnchor="middle" fontWeight="700">{Math.ceil(START[2] - t)}</text>}
          </svg>
          <div className="row card" style={{ padding: 8 }}><span>📍 {(frac * TRIP[m.id][1]).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} milhões km</span><div className="bar" style={{ flex: 1, margin: "0 12px" }}><i style={{ width: frac * 100 + "%" }} /></div><span>{Math.round(frac * 100)}%</span></div></>}
        {ev && <div className="alert row"><span>⚠ {ev.t}!</span><button className="btn gold" onClick={() => setModal(true)}>Tomar Decisão ▶</button></div>}
        {!ev && fb && <small>Última decisão: {fb}</small>}
      </div>
      <div className="simcol">
        <div className="card"><h4>📷 Câmara da Nave</h4><Cam m={m} t={t} ph={ph} s={s} targets={T} landable={landable} zoom={zoom} />
          <div className="row"><button className="btn" onClick={() => setZoom(Math.max(1, +(zoom - .5).toFixed(1)))}>−</button><input type="range" min="1" max="4" step=".5" value={zoom} onChange={e => setZoom(+e.target.value)} aria-label="Zoom" /><button className="btn" onClick={() => setZoom(Math.min(4, +(zoom + .5).toFixed(1)))}>+</button><b>{zoom}×</b></div></div>
        <div className="card"><h4>🧑‍🚀 {mp ? "Missão em equipa" : "Minha Missão (Modo Solo)"}</h4><p><b>{astro.name}</b></p><p>⭐ Pontuação: <b className="gold">{score} pts</b></p></div>
        <div className="card log"><h4>📖 Diário da Missão</h4>{[...s.log].reverse().slice(0, 8).map((l, i) => <div key={i}><small>[{l[0]}]</small> {l[2]} {l[1]}</div>)}</div>
      </div>
    </div>
    <div className="card row instbar"><b>🔬 Instrumentos</b>{r.ins.map(i => <span key={i.id}>{i.icon} {i.name} <b className={s.hp[i.id] >= 50 ? "ok" : "bad"}>{s.hp[i.id]}%</b></span>)}</div>
    {(modal || (mp && ev)) && ev && <div className="overlay"><div className="card modal"><h3>{ev.icon} {ev.t}</h3><p>{ev.d}</p><p className="bubble">🧑‍🚀 {astro.name}: {ev.expl}</p>
      {mp && <small>Votos: {nv}/{mp.room.players.length} — decide a maioria (empate: comandante).</small>}
      {ev.opts.map((o, i) => <button key={o[0]} className="btn blue" style={{ width: "100%", margin: "5px 0" }} onClick={() => vote(o, i)}>{o[0]}</button>)}</div></div>}
  </div>;
}
