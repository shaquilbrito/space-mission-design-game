import { useState, useEffect } from "react";
import { api, getSession, setSession, emptyProgress, saveProgress } from "./store.js";
import Wizard from "./Wizard.jsx";
import Sim from "./Sim.jsx";
import Results from "./Results.jsx";
import Profile from "./Profile.jsx";
import Multi from "./Multi.jsx";
import { addResult, earned } from "./medals.js";
import { music } from "./audio.js";
import { MISSIONS, DIFF_COLOR, status } from "./data.js";

const Nasa = () => <div className="nasa">NASA</div>;

function Nav({ page, go, session, logout, mus, toggleMus }) {
  const L = (p, t) => <a key={p} className={page === p ? "on" : ""} onClick={() => go(p)}>{t}</a>;
  return (
    <header className="nav">
      <div className="logo" onClick={() => go("landing")}><Nasa /> <span>Space <b>Mission</b> Design Game</span></div>
      {L("landing", "Início")}{L("mode", "Jogar")}<button className="btn" onClick={toggleMus} aria-label="Música">{mus ? "🎵" : "🔇"}</button>
      {session ? <><a onClick={() => go("profile")}>👤 {session.user.nick}</a><button className="btn" onClick={logout}>Sair</button></>
        : <><button className="btn" onClick={() => go("auth")}>Entrar</button><button className="btn blue" onClick={() => go("auth:reg")}>Registar</button></>}
    </header>
  );
}

function Landing({ go }) {
  return (
    <div className="page hero">
      <div>
        <h2>Projecta a tua Missão <em>Espacial</em></h2>
        <p>Assume o papel de um engenheiro da NASA, toma decisões estratégicas, gere recursos e lança a tua própria missão espacial.</p>
        <div className="row" style={{ justifyContent: "flex-start", gap: 16, marginTop: 24 }}>
          <button className="btn blue" onClick={() => go("mode")}>▶ Começar a Jogar</button>
          <button className="btn" onClick={() => go("learn")}>📖 Como Funciona</button>
        </div>
      </div>
      <div className="orbit"><div className="sat">🛰️</div><div className="earth" /></div>
    </div>
  );
}

function Auth({ go, onLogin, initial }) {
  const [tab, setTab] = useState(initial), [nick, setNick] = useState(""), [pw, setPw] = useState(""), [err, setErr] = useState(""), [show, setShow] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { const d = await api(tab === "reg" ? "/register" : "/login", "POST", { nick, password: pw }); onLogin({ token: d.token, user: d.user }); }
    catch (x) { setErr(x.message); }
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <div className="tabs"><button type="button" className={tab === "login" ? "on" : ""} onClick={() => setTab("login")}>Login</button>
        <button type="button" className={tab === "reg" ? "on" : ""} onClick={() => setTab("reg")}>Registo</button></div>
      <label className="field">👤<input placeholder="Alcunha" value={nick} onChange={e => setNick(e.target.value)} autoComplete="username" /></label>
      <label className="field">🔒<input placeholder="Palavra-passe" type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} autoComplete={tab === "reg" ? "new-password" : "current-password"} />
        <button type="button" onClick={() => setShow(!show)} style={{ background: "none", border: 0 }} aria-label="Mostrar palavra-passe">👁</button></label>
      <div className="err" role="alert">{err}</div>
      <button className="btn gold" style={{ width: "100%" }} disabled={!nick || !pw}>🚀 {tab === "reg" ? "Registar" : "Entrar"}</button>
      <div className="or">ou</div>
      <button type="button" className="btn" style={{ width: "100%" }} onClick={() => onLogin({ guest: true, user: { nick: "Convidado", progress: emptyProgress() } })}>👤 Jogar como convidado</button>
    </form>
  );
}

function Mode({ go }) {
  return (
    <div className="page"><h1>Escolhe o <em>Modo de Jogo</em></h1><p className="sub">Decide como queres viver a tua missão espacial.</p>
      <div className="grid2">
        <div className="card"><div style={{ fontSize: 80, textAlign: "center" }}>🧑‍🚀</div><h3>Jogar Sozinho</h3><p className="sub">Assume todos os papéis, define a tua estratégia e conduz a missão do início ao fim.</p><button className="btn blue" style={{ width: "100%" }} onClick={() => go("missions")}>▶ Modo Individual</button></div>
        <div className="card"><div style={{ fontSize: 80, textAlign: "center" }}>👩‍🚀🧑‍🚀👨‍🚀</div><h3>Jogar em Equipa</h3><p className="sub">Forma uma equipa de 2 a 4 jogadores, colabora nas decisões e completa a missão em conjunto.</p><button className="btn blue" style={{ width: "100%" }} onClick={() => go("multi")}>👥 Modo Multiplayer</button></div>
      </div></div>
  );
}

function Missions({ go, progress, start }) {
  const done = Object.keys(progress.completed).length, pct = Math.round(done / 6 * 100);
  return (
    <div className="page"><h1>Escolhe a <em>Missão</em></h1><p className="sub">Selecciona uma missão para planeares, projectares e gerires a tua exploração espacial.</p>
      <div className="grid3">
        {MISSIONS.map(m => { const st = status(progress, m.id); return (
          <div key={m.id} className={"card mcard" + (st === "open" ? " sel" : "")}>
            <span className="tag">Missão {m.id}</span>
            <div className="art" style={{ background: `linear-gradient(${m.c}66,#050d24)` }}>{m.planet}</div>
            <h3 style={{ margin: 0 }}>{m.name}</h3><div className="sub" style={{ margin: 0, textAlign: "left" }}>{m.desc}</div>
            <div className="row"><b style={{ color: DIFF_COLOR[m.diff] }}>▂▄ {m.diff}</b>
              <button className="btn gold" disabled={st === "locked"} onClick={() => start(m)}>{st === "locked" ? "🔒 Bloqueada" : st === "done" ? "↻ Repetir" : "▶ Seleccionar"}</button></div>
          </div>); })}
      </div>
      <div className="card row" style={{ marginTop: 18 }}><b>🏁 O teu progresso geral</b><div className="bar" style={{ flex: 1 }}><i style={{ width: pct + "%" }} /></div><b>{pct}%</b></div>
    </div>
  );
}

const Soon = ({ t, back }) => <div className="page"><div className="card auth" style={{ textAlign: "center" }}><h2>{t}</h2><p className="sub">Esta secção chega numa fase seguinte.</p><button className="btn" onClick={back}>← Voltar</button></div></div>;

export default function App() {
  const [session, setS] = useState(getSession), [page, setPage] = useState("landing"), [ptab, setPtab] = useState("overview"), [mission, setMission] = useState(null), [cfg, setCfg] = useState(null), [result, setResult] = useState(null), [mus, setMus] = useState(false), [run, setRun] = useState(0);
  useEffect(() => { if (session && !session.guest) api("/me", "GET", null, session.token).then(d => { const s = { ...session, user: d.user }; setSession(s); setS(s); }).catch(() => { setSession(null); setS(null); }); }, []);
  const go = (p) => setPage(p);
  const login = (s) => { setSession(s); setS(s); go("mode"); };
  const logout = () => { setSession(null); setS(null); go("landing"); };
  const finishRun = (res) => { const np = addResult(progress, mission, res); const s = { ...session, user: { ...session.user, progress: np } }; setSession(s); setS(s); saveProgress(session, np).catch(() => {}); setResult(res); go("results"); };
  const finishMP = (res, m) => { const np = addResult(progress, m, res); np.teamMissions = (np.teamMissions || 0) + 1; np.medals = earned(np); const s = { ...session, user: { ...session.user, progress: np } }; setSession(s); setS(s); saveProgress(session, np).catch(() => {}); };
  const toggleMus = () => { music(!mus); setMus(!mus); };
  const progress = { ...emptyProgress(), ...(session?.user.progress || {}) };
  const guard = (el) => session ? el : <Auth go={go} onLogin={login} initial="login" />;
  return (<>
    <div className="stars" />
    <Nav page={page} go={go} session={session} logout={logout} mus={mus} toggleMus={toggleMus} />
    {page === "landing" && <Landing go={go} />}
    {page.startsWith("auth") && <Auth go={go} onLogin={login} initial={page === "auth:reg" ? "reg" : "login"} />}
    {page === "mode" && guard(<Mode go={go} />)}
    {page === "missions" && guard(<Missions go={go} progress={progress} start={m => { setMission(m); go("mission"); }} />)}
    {page === "profile" && guard(<Profile session={session} progress={progress} tab={ptab} setTab={setPtab} />)}
    {page === "multi" && guard(<Multi session={session} progress={progress} go={go} onResult={finishMP} />)}
    {page === "learn" && <Soon t="Centro de Aprendizagem" back={() => go("landing")} />}
    {page === "mission" && guard(<Wizard key={mission.id} m={mission} session={session} exit={() => go("missions")} toSim={c => { setCfg(c); setRun(x => x + 1); go("sim"); }} />)}
    {page === "sim" && guard(<Sim key={run} m={mission} cfg={cfg} onDone={finishRun} />)}
    {page === "results" && result && guard(<Results m={mission} res={result} cfg={cfg} session={session} onRetry={() => go("mission")} onMenu={() => go("missions")} onNext={() => { const n = MISSIONS[mission.id]; setMission(n); go("mission"); }} />)}
  </>);
}
