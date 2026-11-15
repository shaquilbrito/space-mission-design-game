import { useState } from "react";
import { ASTRONAUTS } from "./catalog.js";
import { MISSIONS } from "./data.js";
const RN = [["e", "⚡ Energia"], ["c", "📡 Comunicação"], ["a", "🗄️ Armazenamento"], ["s", "🍎 Suprimentos"]];
const Q = { good: "✔", mid: "➖", bad: "⚠" };

export default function Results({ m, res, session, cfg, onNext, onRetry, onMenu }) {
  const [view, setView] = useState(null), ok = res.outcome !== "fail", d = res.days >= 1 ? `${res.days} dias` : "< 1 dia";
  const astro = ASTRONAUTS.find(a => a.id === cfg?.astro), unlocked = ok && m.id < 6;
  const title = { total: "Missão Concluída com Sucesso!", partial: "Sucesso Parcial", fail: "Missão Fracassada" }[res.outcome];
  return <div className="page wiz">
    <h2 className="stitle">Etapa 8: Resultados da Missão</h2>
    <div className="wgrid3">
      <div>
        <div className="card"><h4>📋 Resumo da Missão</h4><p>Destino: <b className="gold">{m.name}</b></p><p>Duração total: {d}</p><p>Distância: {res.dist.toLocaleString("pt-PT")} milhões km</p><p>Estado: <b className={ok ? "ok" : "bad"}>{title}</b></p><small>Duração e distância ilustrativas.</small></div>
        <div className="card" style={{ marginTop: 12 }}><h4>🛰️ Desempenho da Nave</h4>{RN.map(([k, n]) => <div key={k}><small>{n} {Math.round(res.resFinal[k])}%</small><div className="bar"><i style={{ width: res.resFinal[k] + "%" }} /></div></div>)}</div>
        <div className="card" style={{ marginTop: 12 }}><h4>📅 Eventos da Simulação</h4><p>✔ Lançamento bem-sucedido.</p>{res.evlog.map(([t, q], i) => <p key={i}>{Q[q]} {t}</p>)}{res.discovery > 0 && <p>⭐ Descoberta científica obtida.</p>}<p>{res.cause ? "✖ " + res.cause : "✔ Chegada concluída."}</p></div>
      </div>
      <div className="card" style={{ textAlign: "center" }}>
        <h2 className={ok ? "ok" : "bad"} style={{ fontSize: 34 }}>{ok ? "🏆" : "💥"} {title}</h2>
        <div style={{ fontSize: 70 }}>{m.planet}</div>
        <p>{ok ? "A nave chegou ao destino e os dados científicos foram recolhidos." : "A missão não atingiu os objectivos mínimos."}</p>
        <h4>🧪 Resultados Científicos Obtidos</h4>
        {res.goals.map(g => <p key={g.g} className={g.ok ? "ok" : "bad"}>{g.ok ? "✔" : "✖"} {g.text}</p>)}
      </div>
      <div>
        <div className="card"><h4>👤 A sua Missão</h4><p>{session.user.nick} · {astro?.name}</p><p>Pontuação Final: <b className="gold" style={{ fontSize: 24 }}>⭐ {res.score.total.toLocaleString("pt-PT")} pts</b> {"★".repeat(res.stars)}</p></div>
        <div className="card" style={{ marginTop: 12 }}><h4>🏆 Avaliação da Missão</h4>{[["Planeamento", res.score.plan], ["Simulação e decisões", res.score.sim], ["Resultados científicos", res.score.sci], ["Bónus (descoberta)", res.score.bonus]].map(([n, v]) => <div className="row" key={n}><span>{n}:</span><b className="gold">{v} pts</b></div>)}</div>
        <div className="card" style={{ marginTop: 12 }}><h4>💡 {ok ? "Recomendação de Melhoria" : "Porque falhou? 3 recomendações"}</h4>{res.cause && <p className="bad">Causa: {res.cause}</p>}{res.recs.map((x, i) => <p key={i}>{i + 1}. {x}</p>)}</div>
      </div>
    </div>
    {view && <div className="card" style={{ marginTop: 12 }}><button style={{ float: "right" }} onClick={() => setView(null)}>✖</button>
      {view === "log" ? <><h4>Diário da Missão</h4>{res.log.map((l, i) => <div key={i}><small>[{l[0]}]</small> {l[2]} {l[1]}</div>)}</>
        : <><h4>Dados Recolhidos</h4>{res.goals.map(g => <p key={g.g}>{g.ok ? "✔" : "✖"} {g.text}</p>)}<p>Instrumentos: {Object.entries(res.hp).map(([k, v]) => `${k} ${v}%`).join(" · ")}</p></>}</div>}
    <div className="row" style={{ marginTop: 16, flexWrap: "wrap" }}><button className="btn" onClick={onRetry}>◀ {ok ? "Repetir missão" : "Tentar novamente"}</button><button className="btn" onClick={() => setView("log")}>📖 Ver Diário da Missão</button><button className="btn" onClick={() => setView("data")}>📊 Ver Dados Recolhidos</button>
      <button className="btn gold" onClick={unlocked ? onNext : onMenu}>{unlocked ? "🚀 Próxima Missão" : "Escolher Missão"}</button></div>
  </div>;
}
