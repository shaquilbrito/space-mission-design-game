import { useState } from "react";
import { MISSIONS, status } from "./data.js";
import { CAMPAIGN, ACH } from "./medals.js";
import { applyAudio } from "./audio.js";

const TABS = [["overview", "Visão Geral"], ["history", "Histórico de Missões"], ["medals", "Medalhas e Conquistas"], ["stats", "Estatísticas"], ["settings", "Definições da Conta"]];
const ST = { done: "✔ Concluída", open: "▶ Disponível", locked: "🔒 Bloqueada" };

function Settings() {
  const [v, setV] = useState(() => ({ vol: .8, mus: .6, sfx: .9, mute: false, ...(JSON.parse(localStorage.getItem("smdg_settings") || "{}")) }));
  const up = (k, x) => { const n = { ...v, [k]: x }; setV(n); localStorage.setItem("smdg_settings", JSON.stringify(n)); applyAudio(); };
  return <div><h3>🔊 Áudio</h3>{[["vol", "Volume geral"], ["mus", "Música de fundo"], ["sfx", "Efeitos sonoros"]].map(([k, n]) => <div className="row" key={k}><span>{n}</span><input type="range" min="0" max="1" step=".05" value={v[k]} onChange={e => up(k, +e.target.value)} /><b>{Math.round(v[k] * 100)}%</b></div>)}
    <label className="row"><span>Silenciar tudo</span><input type="checkbox" checked={v.mute} onChange={e => up("mute", e.target.checked)} /></label><p><small>Idioma: Português (PT)</small></p></div>;
}

export default function Profile({ session, progress: p, tab, setTab }) {
  const [sel, setSel] = useState(0), H = p.history, done = Object.values(p.completed), ok = H.filter(h => h.outcome !== "fail").length;
  const pts = H.reduce((a, h) => a + h.score, 0), rate = H.length ? Math.round(ok / H.length * 100) : 0, chron = [...H].reverse();
  const avg = (k, mx) => H.length ? Math.round(H.reduce((a, h) => a + h.parts[k], 0) / H.length / mx * 100) : 0;
  const maxS = Math.max(10000, ...chron.map(h => h.score));
  const pathD = chron.map((h, i) => `${i ? "L" : "M"}${20 + i * (360 / Math.max(1, chron.length - 1 || 1))},${150 - h.score / maxS * 130}`).join(" ");
  const h = H[sel];
  return <div className="page side">
    <aside><div className="avatar">🧑‍🚀</div><h2 style={{ textAlign: "center", margin: "4px 0" }}>{session.user.nick}</h2>
      <div className="menu card" style={{ padding: 8 }}>{TABS.map(([k, t]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t}</button>)}</div></aside>
    <main>
      <div className="card stat"><div><b>{done.length}/6</b>Missões</div><div><b>{pts.toLocaleString("pt-PT")}</b>Pontos</div><div><b>{p.medals.length}</b>Medalhas</div><div><b>{H.length ? rate + "%" : "—"}</b>Sucesso</div></div>
      <div className="card">
        {tab === "overview" && <>{MISSIONS.map(m => { const s = status(p, m.id); return <div className="row" key={m.id} style={{ padding: "8px 0" }}><span>{m.planet} {m.name}</span><span className={s === "done" ? "ok" : "lock"}>{ST[s]} {p.completed[m.id] ? "★".repeat(p.completed[m.id].stars) : ""}</span></div>; })}</>}
        {tab === "history" && (H.length ? <div className="wgrid2"><div>{H.map((x, i) => <button key={i} className={"row hrow" + (i === sel ? " on" : "")} onClick={() => setSel(i)}><span>{x.name}<br /><small>{x.date}</small></span><span className={x.outcome === "fail" ? "bad" : "ok"}>{x.outcome === "fail" ? "✖ Não concluída" : "✔ Concluída"} {"★".repeat(x.stars)}</span></button>)}</div>
          {h && <div><h3>{h.name}</h3><p>Data: {h.date}</p><p>Duração: {h.days} dias (no jogo)</p><p>Orçamento usado: {h.cost} M USD</p><p>Objectivos: {h.goals} / {h.need}</p><p>Pontuação: <b className="gold">{h.score} pts</b></p></div>}</div> : <p>Ainda não jogaste nenhuma missão.</p>)}
        {tab === "medals" && <div className="wgrid2"><div><h3>Medalhas da Campanha</h3><div className="grid3">{CAMPAIGN.map(([id, n, ic]) => <div key={id} className="medal" style={{ opacity: p.medals.includes(id) ? 1 : .35 }}><div className="hex">{p.medals.includes(id) ? ic : "🔒"}</div><small>{n}</small></div>)}</div></div>
          <div><h3>Conquistas</h3>{ACH.map(a => { const [x, y] = a.prog(p); return <div key={a.id} style={{ margin: "8px 0" }}><div className="row"><b>{a.name}</b><span className={x >= y ? "ok" : "lock"}>{x >= y ? "✔ Concluída" : `${x}/${y}`}</span></div><small>{a.desc}</small><div className="bar"><i style={{ width: x / y * 100 + "%" }} /></div></div>; })}</div></div>}
        {tab === "stats" && (H.length ? <div className="wgrid2"><div><h3>Evolução da Pontuação</h3><svg viewBox="0 0 400 170" width="100%"><path d={pathD} fill="none" stroke="#27d3ff" strokeWidth="3" />{chron.map((x, i) => <circle key={i} cx={20 + i * (360 / Math.max(1, chron.length - 1 || 1))} cy={150 - x.score / maxS * 130} r="4" fill="#fff" />)}</svg></div>
          <div><h3>Desempenho por Categoria</h3>{[["Planeamento", avg("plan", 3000)], ["Ciência", avg("sci", 3000)], ["Decisões", avg("sim", 3500)]].map(([n, v]) => <div key={n}><div className="row"><small>{n}</small><small>{v}%</small></div><div className="bar"><i style={{ width: v + "%" }} /></div></div>)}<h3>Resultados</h3><p className="ok">Concluídas: {ok} ({rate}%)</p><p className="bad">Não concluídas: {H.length - ok}</p></div></div> : <p>As estatísticas aparecem depois da primeira missão.</p>)}
        {tab === "settings" && <Settings />}
      </div>
    </main>
  </div>;
}
