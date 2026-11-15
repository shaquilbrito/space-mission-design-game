import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MISSIONS, status } from "./data.js";
import { ASTRONAUTS, SHIPS, INSTRUMENTS, ROCKETS, ORBITS } from "./catalog.js";
import { Step1, Step2, Step3, Step4, Step5, Step6, Say, NAMES, BUBBLE, calc } from "./Wizard.jsx";
import Sim from "./Sim.jsx";
import Results from "./Results.jsx";
import { Voice } from "./voice.js";

const nm = (list, id) => list.find(x => x.id === id)?.name || id;
function rows(step, room) {
  const V = Object.values(room.votes), c = {}, add = (k) => c[k] = (c[k] || 0) + 1;
  V.forEach(v => { if (step === 2 && v.astro) add(nm(ASTRONAUTS, v.astro)); if (step === 3 && v.ship) add(nm(SHIPS, v.ship)); if (step === 4) (v.instr || []).forEach(i => add(nm(INSTRUMENTS, i)));
    if (step === 5) { if (v.rocket) add("🚀 " + nm(ROCKETS, v.rocket)); if (v.orbit) add("🪐 " + nm(ORBITS, v.orbit).split("(")[0]); }
    if (step === 6 && v.approve !== undefined) add(v.approve ? "👍 Aprovar" : "👎 Rejeitar"); if (step === 8 && v.next !== undefined) add(v.next ? "✔ Sim" : "✖ Não"); });
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
}

export default function Multi({ session, progress, go, onResult }) {
  const so = useRef(null), voice = useRef(null), saved = useRef(0);
  const [room, setRoom] = useState(null), [myid, setMyid] = useState(null), [chat, setChat] = useState([]), [err, setErr] = useState(""), [code, setCode] = useState(""), [off, setOff] = useState(0), [, tick] = useState(0), [txt, setTxt] = useState(""), [msg, say] = useState(""), [vc, setVc] = useState(0);
  const nick = session.user.nick === "Convidado" ? "Convidado" + Math.floor(Math.random() * 90 + 10) : session.user.nick;
  useEffect(() => {
    const s = io({ path: "/socket.io" }); so.current = s;
    s.on("connect", () => setMyid(s.id)); s.on("connect_error", () => setErr("Sem ligação ao servidor (confirma que o backend está a correr)."));
    s.on("room", d => { setRoom(d); setOff(d.now - Date.now() / 1000); }); s.on("chat", m => setChat(c => [...c.slice(-80), m]));
    voice.current = new Voice(s); const t = setInterval(() => tick(x => x + 1), 500);
    return () => { clearInterval(t); voice.current.destroy(); s.disconnect(); };
  }, []);
  const S = so.current, host = room && room.host === myid, m = room && MISSIONS[room.mission - 1];
  const create = () => { const best = MISSIONS.filter(x => status(progress, x.id) !== "locked").slice(-1)[0]?.id || 1; S.emit("create", { nick, mission: best }, d => d.ok && setErr("")); };
  const join = () => S.emit("join", { nick, code }, d => setErr(d.ok ? "" : d.error));
  const leave = () => { S.disconnect(); go("mode"); };
  useEffect(() => { if (room?.step === 8 && room.result && saved.current !== room.tok) { saved.current = room.tok; onResult(room.result, m); } }, [room?.step, room?.tok]);

  if (!room) return <div className="page"><h1>Modo <em>Multiplayer</em></h1><p className="sub">Colabora com outros jogadores para planear e executar a missão em equipa.</p>{err && <p className="err" role="alert">{err}</p>}
    <div className="grid2"><div className="card"><div style={{ fontSize: 60, textAlign: "center" }}>➕👥</div><h3>Criar Sala</h3><p className="sub">Cria uma nova sala e convida a tua equipa.</p><button className="btn gold" style={{ width: "100%" }} onClick={create}>Criar Nova Sala</button></div>
      <div className="card"><div style={{ fontSize: 60, textAlign: "center" }}>👥</div><h3>Entrar numa Sala</h3><label className="field"><span>#</span><input placeholder="Código da Sala" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} /></label><button className="btn blue" style={{ width: "100%" }} disabled={code.length < 6} onClick={join}>Entrar na Sala</button></div></div>
    <p style={{ textAlign: "center" }}><button className="btn" onClick={leave}>← Voltar</button></p></div>;

  const me = room.players.find(p => p.sid === myid), step = room.step, left = room.deadline ? Math.max(0, Math.round(room.deadline - (Date.now() / 1000 + off))) : null;
  const link = `${location.origin} — código ${room.code}`;
  if (!room.started) return <div className="page"><h1>Sala da <em>Equipa</em></h1><p className="sub">Prepara a missão em conjunto e inicia quando todos estiverem prontos.</p>
    <div className="wgrid3"><div className="card"><h3>Missão Seleccionada</h3><div style={{ fontSize: 60, textAlign: "center" }}>{m.planet}</div><b>{m.name}</b><p>{m.desc}</p><p>Dificuldade: {m.diff} · Orçamento: {m.budget} M USD</p>
      {host && <select value={room.mission} onChange={e => S.emit("set_mission", { mission: +e.target.value })}>{MISSIONS.filter(x => status(progress, x.id) !== "locked").map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>}</div>
      <div className="card"><h3>Membros da Equipa ({room.players.length}/4)</h3>{room.players.map(p => <div className="row" key={p.sid} style={{ padding: "6px 0" }}><span>{p.sid === room.host ? "👑" : "🧑‍🚀"} {p.nick} <small>({p.role})</small></span><b className={p.ready ? "ok" : "gold"}>{p.ready ? "Pronto" : "A preparar…"}</b></div>)}
        {!host && <button className="btn blue" style={{ width: "100%" }} onClick={() => S.emit("ready")}>{me?.ready ? "Cancelar pronto" : "Estou pronto"}</button>}</div>
      <div className="card"><h3>Código da Sala</h3><h2 className="gold" style={{ letterSpacing: 6, textAlign: "center" }}>{room.code}</h2><div className="row"><button className="btn" onClick={() => navigator.clipboard?.writeText(room.code)}>📋 Copiar</button><a className="btn" href={`https://wa.me/?text=${encodeURIComponent("Junta-te à minha missão espacial! " + link)}`} target="_blank" rel="noreferrer">WhatsApp</a></div></div></div>
    {err && <p className="err" role="alert">{err}</p>}
    <div className="row" style={{ justifyContent: "center", gap: 16, marginTop: 16 }}><button className="btn" onClick={leave}>← Sair da Sala</button>{host && <button className="btn gold" onClick={() => S.emit("start", {}, d => setErr(d.ok ? "" : d.error))}>▶ Iniciar Missão</button>}</div>
    <div className="card" style={{ maxWidth: 520, margin: "16px auto" }}><Chat chat={chat} txt={txt} setTxt={setTxt} send={() => { txt && S.emit("chat", { text: txt }); setTxt(""); }} /></div></div>;

  const V = room.votes[myid] || {}, cast = (p) => S.emit("vote", { payload: p });
  const c = step === 2 ? { ...room.cfg, astro: V.astro ?? null } : step === 3 ? { ...room.cfg, ship: V.ship ?? null } : step === 4 ? { ...room.cfg, instr: V.instr ?? [] } : step === 5 ? { ...room.cfg, rocket: V.rocket ?? null, orbit: V.orbit ?? null } : room.cfg;
  const set = (p) => step === 2 ? cast({ astro: p.astro }) : step === 3 ? cast({ ship: p.ship }) : step === 4 ? (p.instr.length <= 2 && cast({ instr: p.instr })) : step === 5 ? cast({ ...V, ...p }) : S.emit("propose", { res: p.res });
  const r = calc(m, room.cfg), rep = rows(step, room);
  const body = { 1: <Step1 m={m} next={() => host && S.emit("go_step", { step: 2 })} />, 2: <Step2 c={c} set={set} />, 3: <Step3 m={m} c={c} set={set} />, 4: <Step4 m={m} c={c} set={set} />, 5: <Step5 m={m} c={c} set={set} />, 6: <Step6 m={m} c={room.cfg} set={set} /> }[step];
  const astro = ASTRONAUTS.find(a => a.id === room.cfg.astro);
  const side = <aside className="mpside">
    <div className="card"><h4>👥 Equipa da Missão ({room.players.length}/4)</h4>{room.players.map(p => <div className="row" key={p.sid}><span>{p.sid === room.host ? "👑" : "🧑‍🚀"} {p.nick}{p.sid === myid ? " (Tu)" : ""} <small>{p.role}</small></span><span className="ok">●</span></div>)}
      <div className="row" style={{ marginTop: 6 }}>{vc === 0 ? <button className="btn" onClick={() => voice.current.start().then(() => setVc(1)).catch(() => setErr("Microfone indisponível."))}>🎤 Ligar voz</button> : <><button className="btn" onClick={() => { voice.current.mute(vc === 1); setVc(vc === 1 ? 2 : 1); }}>{vc === 1 ? "🎤 Silenciar" : "🔇 Activar"}</button><button className="btn" onClick={() => { voice.current.stop(); setVc(0); }}>Sair da voz</button></>}</div></div>
    {step >= 2 && step <= 8 && step !== 7 && <div className="card"><h4>🗳 Votação da Equipa {left !== null && <span className="gold">⏱ {left}s</span>}</h4><small>Cada jogador tem 1 voto{step === 4 ? " por escolha (até 2 instrumentos)" : ""}. Empate: decide o comandante.</small>
      {rep.length ? rep.map(([k, n]) => <div key={k}><div className="row"><small>{k}</small><small>{n} voto(s) ({Math.round(n / room.players.length * 100)}%)</small></div><div className="bar"><i style={{ width: n / room.players.length * 100 + "%" }} /></div></div>) : <p><small>Ainda sem votos.</small></p>}
      <small>Votaram: {Object.keys(room.votes).length}/{room.players.length}</small></div>}
    <div className="card"><Chat chat={chat} txt={txt} setTxt={setTxt} send={() => { txt && S.emit("chat", { text: txt }); setTxt(""); }} /></div></aside>;
  const head = <><div className="steps"><span className="st on">Sala #{room.code}</span>{NAMES.map((n, i) => <span key={n} className={"st" + (i + 1 === step ? " on" : i + 1 < step ? " done" : "")}>{i + 1 < step ? "✔" : i + 1} {n}</span>)}<button className="btn" onClick={leave}>🏠</button></div></>;

  if (step === 7) return <div className="page wiz">{head}<Sim key={room.tok} m={m} cfg={room.cfg} mp={{ socket: S, host, room }} onDone={res => S.emit("finish", { res })} />
    <div className="mpgrid"><div /> {side}</div></div>;
  if (step === 8 && room.result) return <div className="page wiz">{head}<div className="mpgrid"><div><Results m={m} res={room.result} cfg={room.cfg} session={session}
      onRetry={() => host && S.emit("go_step", { step: 6 })} onNext={() => cast({ next: true })} onMenu={() => cast({ next: false })} />
      <div className="card"><h4>🚀 Jogar a próxima missão? (votação)</h4><small>{host ? "Os botões da equipa votam: «Próxima Missão» = Sim; «Escolher Missão» = Não." : "Vota com os botões abaixo."}</small><div className="row"><button className="btn blue" onClick={() => cast({ next: true })}>✔ Sim</button><button className="btn" onClick={() => cast({ next: false })}>✖ Não</button></div></div></div>{side}</div></div>;

  const need3 = step === 6 && r.got < 3, can6 = r.ok && !need3;
  return <Say.Provider value={say}><div className="page wiz">{head}<h2 className="stitle">Etapa {step}: {NAMES[step - 1]}</h2>
    <div className="mpgrid"><div className="wrow"><aside className="guide"><div className="face big">{astro ? (astro.g === "f" ? "👩‍🚀" : "👨‍🚀") : "👩‍🚀"}</div><div className="bubble">{msg || BUBBLE[step]}</div></aside><section style={{ flex: 1 }}>{body}
      {step === 6 && <div className="card" style={{ marginTop: 12 }}><h4>Votação: aprovar esta distribuição?</h4>{need3 && <p className="bad">⚠ Menos de 3 objectivos cobertos: o comandante deve voltar à etapa 4.</p>}{!r.ok && <p className="bad">⚠ Há verificações a vermelho.</p>}
        <div className="row"><button className="btn blue" disabled={!can6} onClick={() => cast({ approve: true })}>👍 Aprovar</button><button className="btn" onClick={() => cast({ approve: false })}>👎 Rejeitar</button></div></div>}
      <div className="row" style={{ marginTop: 14 }}>{host ? <><button className="btn" disabled={step <= 1} onClick={() => S.emit("go_step", { step: step - 1 })}>◀ Etapa Anterior</button>{step >= 2 && <button className="btn gold" onClick={() => S.emit("close_vote")}>🗳 Encerrar votação</button>}</> : <span className="gold">⏳ {step === 1 ? "A aguardar o comandante…" : "A aguardar o resultado da votação…"}</span>}</div></section></div>{side}</div>
    {err && <p className="err">{err}</p>}</div></Say.Provider>;
}

function Chat({ chat, txt, setTxt, send }) {
  const end = useRef(null); useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [chat.length]);
  return <div><h4>💬 Chat da Equipa</h4><div className="chat">{chat.map((c, i) => <div key={i}><b>{c.nick}</b> <small>{c.ts}</small><br />{c.text}</div>)}<div ref={end} /></div>
    <div className="row"><input className="chatin" value={txt} placeholder="Escreve uma mensagem…" onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} /><button className="btn blue" onClick={send}>➤</button></div></div>;
}
