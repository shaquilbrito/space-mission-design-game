import { useState, useEffect, createContext, useContext } from "react";
import { REQS, GOALS, MGOALS, MOBJ, SHIPS, SHIP_TYPES, INSTRUMENTS, ROCKETS, ORBITS, ASTRONAUTS, GLOSS } from "./catalog.js";

export const Say = createContext(() => {});
export const T = ({ k, children }) => { const say = useContext(Say); return <button className="term" onClick={() => say(GLOSS[k])}>{children || k}</button>; };
export const NAMES = ["Missão", "Astronauta", "Nave", "Instrumentos", "Foguete e Órbita", "Recursos", "Simulação", "Resultados"];
const RES = [["e", "⚡ Energia", 150, 15], ["c", "📡 Comunicação", 40, 10], ["a", "🗄️ Armazenamento", 30, 8], ["s", "🍎 Suprimentos", 80, 12]];

export function calc(m, c) {
  const ship = SHIPS.find(s => s.id === c.ship), rocket = ROCKETS.find(r => r.id === c.rocket), orbit = ORBITS.find(o => o.id === c.orbit);
  const ins = INSTRUMENTS.filter(i => c.instr.includes(i.id)), [rm, rp, rd] = REQS[m.id];
  const sum = (k) => ins.reduce((a, i) => a + i[k], 0);
  const resMass = RES.reduce((a, [k, , w]) => a + c.res[k] * w, 0), resCost = RES.reduce((a, [k, , , p]) => a + c.res[k] * p, 0);
  const payload = sum("mass") + resMass, total = (ship?.mass || 0) + payload;
  const cost = (ship?.cost || 0) + sum("cost") + (rocket?.cost || 0) + (orbit?.cost || 0) + resCost;
  const power = (ship?.power || 0) + c.res.e * 400, use = 100 + sum("power") + c.res.c * 40;
  const data = sum("data"), comm = (ship?.data || 0) + c.res.c * 2, store = c.res.a * 50;
  const covered = new Set(ins.flatMap(i => i.goals)), need = MGOALS[m.id], got = need.filter(g => covered.has(g)).length;
  const checks = [
    [!ship || ship.dest.includes(m.id), "A nave é compatível com o destino"],
    [cost <= m.budget, `Orçamento: ${cost} de ${m.budget} M USD`],
    [payload <= Math.min(rm, ship?.cargo ?? 1e9), `Carga útil ${payload} kg (limite ${Math.min(rm, ship?.cargo ?? rm)} kg)`],
    [!rocket || total <= rocket.payload, `Massa total ${total} kg (foguete ${rocket?.payload ?? "—"} kg)`],
    [power >= rp && power >= use, `Energia: ${power} W produzidos, ${use} W consumidos (mín. ${rp} W)`],
    [comm >= Math.max(rd, data), `Comunicação: ${comm} GB/dia (necessário ${Math.max(rd, data).toFixed(1)})`],
    [store >= data * 10, `Armazenamento: ${store} GB (buffer de 10 dias: ${(data * 10).toFixed(0)} GB)`],
    [!orbit || orbit.dest.includes(m.id), "A órbita é adequada à missão"],
    [!ship?.crew || c.res.s >= 2, "Suprimentos suficientes para a tripulação"],
  ];
  const pct = (a, b) => Math.min(100, Math.round(a / b * 100));
  return { ship, rocket, orbit, ins, payload, total, cost, power, use, data, comm, store, got, need, checks, ok: checks.every(x => x[0]),
    gauges: [["Orçamento utilizado", pct(cost, m.budget)], ["Massa total", rocket ? pct(total, rocket.payload) : 0], ["Energia disponível", pct(use, power)], ["Armazenamento necessário", store ? pct(data * 10, store) : 100], ["Capacidade de comunicação", pct(Math.max(rd, data), comm || 1)]] };
}

function Intro({ m, playing, t }) {
  return <div className="video" style={{ background: `radial-gradient(circle at 75% 40%,${m.c},#050d24 60%)` }}>
    <div className="planet" style={{ background: m.c, transform: `scale(${1 + t / 60})` }} />
    <div className="vship" style={{ left: `${10 + t * 2.4}%` }}>🚀</div>
    <div className="vcap">{t < 10 ? "A Terra fica para trás…" : t < 22 ? "Viagem pelo espaço…" : `Chegada: ${m.name}`}</div>
    <div className="row" style={{ position: "absolute", bottom: 8, left: 12, right: 12 }}><span>0:{String(Math.floor(t)).padStart(2, "0")} / 0:30</span><div className="bar" style={{ flex: 1, margin: "0 12px" }}><i style={{ width: t / 30 * 100 + "%" }} /></div>{playing ? "⏸" : "▶"}</div>
  </div>;
}

export function Step1({ m, next }) {
  const [t, setT] = useState(0), [play, setPlay] = useState(true), [a, e, d] = REQS[m.id];
  useEffect(() => { if (!play) return; const i = setInterval(() => setT(x => x >= 30 ? (setPlay(false), 30) : x + 0.5), 500); return () => clearInterval(i); }, [play]);
  return <div className="wgrid">
    <div onClick={() => setPlay(!play)} style={{ cursor: "pointer" }}><Intro m={m} playing={play} t={t} /></div>
    <div className="card"><h3>📋 Resumo da Missão</h3>
      <p><b>Destino:</b> {m.name}</p><p><b>Duração:</b> {m.duration}</p><p><b><T k="orçamento">Orçamento</T>:</b> {m.budget} M USD</p><p><b>Dificuldade:</b> {m.diff}</p></div>
    <div className="card"><h3>🎯 Objectivos Principais</h3>{MOBJ[m.id].map(o => <p key={o}>• {o}</p>)}</div>
    <div className="card"><h3>⚙️ Requisitos Essenciais</h3><div className="stat" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
      <div><T k="massa">Massa</T><b>≤ {a} kg</b></div><div><T k="potência">Potência</T><b>≥ {e} W</b></div><div><T k="dados">Dados</T><b>≥ {d} GB/dia</b></div></div></div>
    <div className="row wfull"><button className="btn" onClick={() => setT(0) || setPlay(true)}>↻ Rever história</button><button className="btn" onClick={() => { setT(30); setPlay(false); }}>⏭ Saltar vídeo</button><button className="btn gold" onClick={next}>Aceitar missão ▶</button></div>
  </div>;
}

export function Step2({ c, set }) {
  const a = ASTRONAUTS.find(x => x.id === c.astro);
  return <div><div className="grid4">{ASTRONAUTS.map(x => <button key={x.id} className={"card pick" + (c.astro === x.id ? " sel" : "")} onClick={() => set({ astro: x.id })}>
    <div className="face">{x.g === "f" ? "👩‍🚀" : "👨‍🚀"}</div><b>{x.name}</b><small>{x.spec}</small><small>⭐ {x.exp}</small>
    {["Planeamento", "Técnica", "Equipa"].map((s, i) => <div key={s} className="row"><small>{s}</small><div className="bar" style={{ width: 70 }}><i style={{ width: x.skills[i] * 20 + "%" }} /></div></div>)}</button>)}</div>
    {a && <div className="card" style={{ marginTop: 14 }}><h3>{a.name} — {a.nat}</h3><p>{a.bio}</p><p><b>Formação:</b> {a.edu} · <b>Especialização:</b> {a.spec}</p><p>💡 {a.fun}</p></div>}</div>;
}

export function Step3({ m, c, set }) {
  const [p, setP] = useState(0), [spec, setSpec] = useState(null), pair = SHIPS.slice(p * 2, p * 2 + 2), s = SHIPS.find(x => x.id === spec);
  return <div className="wgrid2"><div>
    <div className="row"><button className="btn" disabled={!p} onClick={() => setP(p - 1)}>◀</button>
      <div className="grid2" style={{ flex: 1, margin: "0 10px", gap: 12 }}>{pair.map(x => <div key={x.id} className={"card" + (c.ship === x.id ? " sel" : "")}>
        <div className="face">{{ crew: "🚀", probe: "🛰️", sat: "📡", rover: "🤖", lander: "🛬" }[x.type]}</div><b>{x.name}</b><small>{SHIP_TYPES[x.type]}</small><p>{x.desc}</p>
        <p className="gold">💰 {x.cost} M USD</p>{!x.dest.includes(m.id) && <small className="bad">⚠ Incompatível com esta missão</small>}
        <div className="row"><button className="btn" onClick={() => setSpec(x.id)}>🔍 Especificações</button><button className="btn blue" disabled={!x.dest.includes(m.id)} onClick={() => set({ ship: x.id, instr: [] })}>{c.ship === x.id ? "✔" : "Escolher"}</button></div></div>)}</div>
      <button className="btn" disabled={p >= 5} onClick={() => setP(p + 1)}>▶</button></div><p className="sub">Página {p + 1}/6 — 12 veículos</p></div>
    {s && <div className="card spec"><div className="row"><h3>{s.name}</h3><button onClick={() => setSpec(null)}>✖</button></div>
      {[["Fabricante", s.maker], ["Categoria", SHIP_TYPES[s.type]], ["Massa", s.mass + " kg"], ["Capacidade de carga", s.cargo + " kg"], ["Energia", s.power + " W"], ["Transmissão", s.data + " GB/dia"], ["Autonomia", s.life], ["Tripulação", s.crew || "—"], ["Dimensões", s.dim], ["Destinos", s.dest.join(", ")], ["Custo", s.cost + " M USD"]].map(([k, v]) => <div className="row" key={k}><small>{k}</small><span>{v}</span></div>)}
      <p className="ok">✔ {s.pros.join(" · ")}</p><p className="bad">⚠ {s.cons.join(" · ")}</p><small>Valores de simulação (estimativas).</small></div>}
  </div>;
}

export function Step4({ m, c, set }) {
  const [p, setP] = useState(0), [sel, setSel] = useState("cam"), ship = SHIPS.find(s => s.id === c.ship), v = INSTRUMENTS.slice(p * 4, p * 4 + 4), d = INSTRUMENTS.find(i => i.id === sel), r = calc(m, c);
  const toggle = (i) => set({ instr: c.instr.includes(i.id) ? c.instr.filter(x => x !== i.id) : [...c.instr, i.id] });
  const ok = (i) => ship && i.compat.includes(ship.type);
  return <div className="wgrid3">
    <div className="card"><div className="row"><button onClick={() => setP(0)}>◀</button><b>Catálogo ({p + 1}/2)</b><button onClick={() => setP(1)}>▶</button></div>
      <div className="grid2" style={{ gap: 8 }}>{v.map(i => <div key={i.id} className={"card pick" + (c.instr.includes(i.id) ? " sel" : "")} onClick={() => setSel(i.id)}>
        <div className="face">{i.icon}</div><b>{i.name}</b><small>{i.cost} M USD</small>{!ok(i) && <small className="bad">⚠ Incompatível com a nave</small>}
        <button className="btn" disabled={!ok(i)} onClick={e => { e.stopPropagation(); toggle(i); }}>{c.instr.includes(i.id) ? "✔ Seleccionado" : "Seleccionar"}</button></div>)}</div></div>
    <div className="card"><h3>{d.icon} {d.name}</h3><p>{d.fn}</p>{[["Massa", d.mass + " kg"], ["Consumo", d.power + " W"], ["Dados", d.data + " GB/dia"], ["Vida útil", d.life], ["Preço", d.cost + " M USD"], ["Objectivos", d.goals.map(g => GOALS[g]).join("; ")]].map(([k, x]) => <div className="row" key={k}><small>{k}</small><span>{x}</span></div>)}
      <p className="ok">✔ {d.pros.join(" · ")}</p><p className="bad">⚠ {d.cons.join(" · ")}</p></div>
    <div className="card"><h3>Seleccionados ({c.instr.length})</h3>{r.ins.map(i => <div className="row" key={i.id}><span>{i.icon} {i.name}</span><button onClick={() => toggle(i)}>✖</button></div>)}<b className="gold">Custo: {r.ins.reduce((a, i) => a + i.cost, 0)} M USD</b></div>
    <div className="card wfull"><h3>🎯 Objectivos científicos</h3><div className="grid2" style={{ gap: 4 }}>{MGOALS[m.id].map(g => <span key={g}>{r.ins.some(i => i.goals.includes(g)) ? "✅" : "⬜"} {GOALS[g]}</span>)}</div></div>
  </div>;
}

export function Step5({ m, c, set }) {
  const ro = ROCKETS.find(x => x.id === c.rocket), or = ORBITS.find(x => x.id === c.orbit);
  const cyc = (list, key, d) => set({ [key]: list[(Math.max(0, list.findIndex(x => x.id === c[key])) + d + list.length) % list.length].id });
  return <div className="wgrid2">
    <div className="card"><h3>1 · Veículo de lançamento</h3><div className="row"><button className="btn" onClick={() => cyc(ROCKETS, "rocket", -1)}>◀</button>
      <div style={{ textAlign: "center" }}><div className="face">🚀</div><b>{ro ? ro.name : "Escolhe um foguete"}</b>{ro && <><p><T k="massa">Carga</T>: {ro.payload} kg · {ro.cost} M USD</p><p>{ro.pros}</p></>}</div><button className="btn" onClick={() => cyc(ROCKETS, "rocket", 1)}>▶</button></div>
      {ro && [["Fabricante", ro.maker], ["Estágios", ro.stages], ["Reutilização", ro.reuse], ["Dimensões", ro.dim]].map(([k, v]) => <div className="row" key={k}><small>{k === "Estágios" ? <T k="estágios">Estágios</T> : k}</small><span>{v}</span></div>)}</div>
    <div className="card"><h3>2 · <T k="órbita">Órbita</T></h3><div className="row"><button className="btn" onClick={() => cyc(ORBITS, "orbit", -1)}>◀</button>
      <div style={{ textAlign: "center" }}><div className="face">🪐</div><b>{or ? or.name : "Escolhe uma órbita"}</b></div><button className="btn" onClick={() => cyc(ORBITS, "orbit", 1)}>▶</button></div>
      {or && [["Tipo", or.type], ["Período", or.period], ["Cobertura", or.cover], ["Finalidade", or.purpose], ["Consumo relativo", or.use], ["Custo", or.cost + " M USD"], ["Destinos", or.dest.join(", ")]].map(([k, v]) => <div className="row" key={k}><small>{k}</small><span>{v}</span></div>)}
      {or && !or.dest.includes(m.id) && <p className="bad">⚠ Esta órbita não serve a missão actual.</p>}</div></div>;
}

export function Step6({ m, c, set }) {
  const r = calc(m, c);
  return <div className="wgrid2"><div>
    <div className="card"><h3>Distribui os recursos</h3>{RES.map(([k, n]) => <div className="row" key={k} style={{ margin: "8px 0" }}><span>{n}</span>
      <button className="btn" onClick={() => set({ res: { ...c.res, [k]: Math.max(0, c.res[k] - 1) } })}>−</button>
      <div className="bar" style={{ width: 120 }}><i style={{ width: c.res[k] * 20 + "%" }} /></div>
      <button className="btn" onClick={() => set({ res: { ...c.res, [k]: Math.min(5, c.res[k] + 1) } })}>+</button><b>{c.res[k]}/5</b></div>)}</div>
    <div className="card" style={{ marginTop: 12 }}><h3>Resumo</h3><p><T k="massa">Massa total</T>: {r.total} kg · Custo: {r.cost} M USD</p>
      {r.gauges.map(([n, v]) => <div key={n}><div className="row"><small>{n}</small><small>{v}%</small></div><div className="bar"><i style={{ width: v + "%", background: v > 100 || v >= 95 ? "var(--bad)" : undefined }} /></div></div>)}</div></div>
    <div className="card"><h3>Verificação da missão</h3>{r.checks.map(([ok, t]) => <p key={t} className={ok ? "ok" : "bad"}>{ok ? "✔" : "✖"} {t}</p>)}
      <p>Objectivos cobertos: {r.got}/{r.need.length} (mínimo 3)</p>{!r.ok && <small>Corrige os pontos a vermelho; senão a simulação falha.</small>}</div></div>;
}

export const BUBBLE = { 1: "Vamos explorar! Vê o resumo e aceita a missão.", 2: "Escolhe o astronauta que me acompanha na missão.", 3: "Escolhe a nave. Compara custo, carga e autonomia.", 4: "Escolhe instrumentos que cumpram os objectivos científicos.", 5: "Escolhe o foguete e a órbita certa para o destino.", 6: "Ajusta os recursos. Cada escolha tem consequências na simulação!" };

export default function Wizard({ m, session, exit, toSim }) {
  const init = () => { try { const s = JSON.parse(localStorage.getItem("smdg_cfg_" + m.id)); if (s) return s; } catch {} return { step: 1, astro: null, ship: null, instr: [], rocket: null, orbit: null, res: { e: 3, c: 3, a: 3, s: 3 } }; };
  const [c, setC] = useState(init), [msg, say] = useState(""), [panel, setPanel] = useState(null);
  const set = (p) => setC(x => { const n = { ...x, ...p }; localStorage.setItem("smdg_cfg_" + m.id, JSON.stringify(n)); return n; });
  const r = calc(m, c), step = c.step, astro = ASTRONAUTS.find(a => a.id === c.astro);
  const can = { 1: true, 2: !!c.astro, 3: !!c.ship, 4: r.got >= 3, 5: !!c.rocket && !!c.orbit && r.orbit.dest.includes(m.id), 6: r.ok }[step];
  const go = (d) => { say(""); d > 0 && step === 6 ? toSim(c) : set({ step: Math.max(1, step + d) }); };
  const P = { 1: <Step1 m={m} next={() => go(1)} />, 2: <Step2 c={c} set={set} />, 3: <Step3 m={m} c={c} set={set} />, 4: <Step4 m={m} c={c} set={set} />, 5: <Step5 m={m} c={c} set={set} />, 6: <Step6 m={m} c={c} set={set} /> }[step];
  return <Say.Provider value={say}><div className="page wiz">
    <div className="steps">{NAMES.map((n, i) => <span key={n} className={"st" + (i + 1 === step ? " on" : i + 1 < step ? " done" : "")}>{i + 1 < step ? "✔" : i + 1} {n}</span>)}<button className="btn" onClick={exit}>🏠</button></div>
    <div className="tool"><button onClick={() => setPanel("orc")}>💰 Orçamento: {m.budget - r.cost} M USD</button><button onClick={() => setPanel("mis")}>🎯 Missão</button><button onClick={() => setPanel("ast")}>👩‍🚀 Astronauta</button></div>
    {panel && <div className="card panel"><button style={{ float: "right" }} onClick={() => setPanel(null)}>✖</button>
      {panel === "orc" && <><h3>Orçamento</h3><p>Total {m.budget} M USD · Gasto {r.cost} · Restante {m.budget - r.cost}</p></>}
      {panel === "mis" && <><h3>{m.name}</h3><p>{m.desc}</p>{MOBJ[m.id].map(o => <p key={o}>• {o}</p>)}</>}
      {panel === "ast" && <><h3>{astro ? astro.name : "Nenhum astronauta"}</h3><p>{astro?.bio}</p></>}</div>}
    <h2 className="stitle">Etapa {step}: {NAMES[step - 1]}</h2>
    <div className="wrow"><aside className="guide"><div className="face big">{astro ? (astro.g === "f" ? "👩‍🚀" : "👨‍🚀") : "👩‍🚀"}</div><div className="bubble">{msg || BUBBLE[step]}</div></aside><section style={{ flex: 1 }}>{P}</section></div>
    {step > 1 && <div className="row" style={{ marginTop: 16 }}><button className="btn" onClick={() => go(-1)}>◀ Voltar</button>
      <button className="btn gold" disabled={!can} onClick={() => go(1)}>{step === 6 ? "Avançar: Simulação ▶" : "Continuar ▶"}</button></div>}
  </div></Say.Provider>;
}
