"""Multiplayer: salas, votação, chat, simulação sincronizada e sinalização WebRTC (Flask-SocketIO)."""
import random, time
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")
rooms = {}
SECS, EV_SECS = 60, 30
ROLES = ["Comandante", "Engenheiro(a)", "Cientista", "Gestor(a)"]
NEXT = {2: 3, 3: 4, 4: 5, 5: 6, 6: 7}

def new_cfg(): return {"astro": None, "ship": None, "instr": [], "rocket": None, "orbit": None, "res": {"e": 3, "c": 3, "a": 3, "s": 3}}
def pub(r): return {**{k: v for k, v in r.items() if k != "evv"}, "now": time.time(), "evvotes": r["evv"]}
def push(r): socketio.emit("room", pub(r), to=r["code"])

def plurality(vals, tiebreak):
    c = {}
    for v in vals: c[v] = c.get(v, 0) + 1
    if not c: return None
    top = [v for v, n in c.items() if n == max(c.values())]
    return tiebreak if tiebreak in top else top[0]

def resolve(r):
    """Fecha a votação da etapa actual. Devolve True se avançou."""
    st, V, cfg = r["step"], r["votes"], r["cfg"]
    hv = V.get(r["host"], {})
    if st in (2, 3, 5):
        for f in {2: ["astro"], 3: ["ship"], 5: ["rocket", "orbit"]}[st]:
            w = plurality([v[f] for v in V.values() if v.get(f) is not None], hv.get(f))
            if w is None: return False
            cfg[f] = w
        if st == 3: cfg["instr"] = []
    elif st == 4:
        c = {}
        for v in V.values():
            for i in v.get("instr", []): c[i] = c.get(i, 0) + 1
        if not c: return False
        cfg["instr"] = sorted(c, key=lambda i: (-c[i], i not in hv.get("instr", [])))[:4]
    elif st == 6:
        yes = sum(1 for v in V.values() if v.get("approve") is True); no = sum(1 for v in V.values() if v.get("approve") is False)
        if not (yes > no or (yes == no and yes > 0 and hv.get("approve"))):
            r["votes"] = {}
            return False
    elif st == 8:
        yes = sum(1 for v in V.values() if v.get("next") is True); no = sum(1 for v in V.values() if v.get("next") is False)
        if not (yes > no or (yes == no and yes > 0 and hv.get("next"))):
            r.update(started=False, step=0, votes={}, deadline=None, result=None, tok=r["tok"] + 1); return True
        r.update(mission=min(6, r["mission"] + 1), cfg=new_cfg(), step=1, votes={}, deadline=None, result=None, tok=r["tok"] + 1); return True
    else: return False
    enter(r, NEXT[st]); return True

def enter(r, step):
    r["step"] = step; r["votes"] = {}; r["tok"] += 1
    r["deadline"] = time.time() + SECS if step in (2, 3, 4, 5, 6, 8) else None
    if r["deadline"]: socketio.start_background_task(timer, r["code"], r["tok"])

def timer(code, tok):
    socketio.sleep(SECS)
    r = rooms.get(code)
    if not r or r["tok"] != tok: return
    if not resolve(r):                      # ninguém votou: prolonga
        r["deadline"] = time.time() + SECS; socketio.start_background_task(timer, code, tok)
    push(r)

def me(): 
    for r in rooms.values():
        if any(p["sid"] == request.sid for p in r["players"]): return r
def is_host(r): return r and r["host"] == request.sid
def mk_code():
    while True:
        c = "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", k=6))
        if c not in rooms: return c

@socketio.on("create")
def on_create(d):
    code = mk_code(); sid = request.sid
    rooms[code] = dict(code=code, host=sid, mission=int(d.get("mission", 1)), private=True, started=False, step=0, cfg=new_cfg(), votes={}, deadline=None, result=None, tok=0, evv={}, voice=[],
                       players=[dict(sid=sid, nick=d.get("nick", "Jogador")[:20], ready=True, role=ROLES[0])])
    join_room(code); push(rooms[code]); return {"ok": True, "code": code}

@socketio.on("join")
def on_join(d):
    r = rooms.get((d.get("code") or "").strip().upper())
    if not r: return {"ok": False, "error": "Sala não encontrada."}
    if r["started"]: return {"ok": False, "error": "A missão já começou."}
    if len(r["players"]) >= 4: return {"ok": False, "error": "A sala está cheia (máx. 4)."}
    nick = d.get("nick", "Jogador")[:20]
    while any(p["nick"] == nick for p in r["players"]): nick += str(random.randint(1, 9))
    r["players"].append(dict(sid=request.sid, nick=nick, ready=False, role=ROLES[len(r["players"])]))
    join_room(r["code"]); push(r); return {"ok": True, "code": r["code"]}

@socketio.on("ready")
def on_ready():
    r = me()
    if r:
        for p in r["players"]:
            if p["sid"] == request.sid: p["ready"] = not p["ready"]
        push(r)

@socketio.on("set_mission")
def on_mission(d):
    r = me()
    if is_host(r) and not r["started"]: r["mission"] = int(d["mission"]); push(r)

@socketio.on("start")
def on_start():
    r = me()
    if is_host(r) and all(p["ready"] for p in r["players"]):
        r.update(started=True, cfg=new_cfg(), result=None, evv={}); r["tok"] += 1; r["step"] = 1; r["votes"] = {}; push(r)
        return {"ok": True}
    return {"ok": False, "error": "Todos os jogadores têm de estar prontos."}

@socketio.on("go_step")
def on_go(d):
    r = me()
    if is_host(r) and r["started"]: enter(r, int(d["step"])); push(r)

@socketio.on("vote")
def on_vote(d):
    r = me()
    if not r or r["step"] not in (2, 3, 4, 5, 6, 8): return
    r["votes"][request.sid] = d.get("payload", {})
    if len(r["votes"]) == len(r["players"]): resolve(r)
    push(r)

@socketio.on("close_vote")
def on_close():
    r = me()
    if is_host(r): resolve(r); push(r)

@socketio.on("propose")
def on_propose(d):
    r = me()
    if r and r["step"] == 6:
        r["cfg"]["res"] = {k: max(0, min(5, int(v))) for k, v in d["res"].items()}; r["votes"] = {}; push(r)

@socketio.on("chat")
def on_chat(d):
    r = me()
    if r:
        nick = next(p["nick"] for p in r["players"] if p["sid"] == request.sid)
        emit("chat", {"nick": nick, "text": str(d.get("text", ""))[:300], "ts": time.strftime("%H:%M")}, to=r["code"])

@socketio.on("sim_state")
def on_sim(d):
    r = me()
    if is_host(r): emit("sim_state", d, to=r["code"], include_self=False)

@socketio.on("sim_input")
def on_input(d):
    r = me()
    if r and not is_host(r): emit("sim_input", d, to=r["host"])

@socketio.on("ev_open")
def on_ev_open(d):
    r = me()
    if is_host(r):
        r["evv"] = {}; r["evtok"] = r.get("evtok", 0) + 1; push(r)
        socketio.start_background_task(ev_timer, r["code"], r["evtok"])

def ev_resolve(r):
    idx = plurality(list(r["evv"].values()), r["evv"].get(r["host"]))
    r["evtok"] = r.get("evtok", 0) + 1; r["evv"] = {}
    socketio.emit("ev_result", idx if idx is not None else 2, to=r["code"]); push(r)

def ev_timer(code, tok):
    socketio.sleep(EV_SECS)
    r = rooms.get(code)
    if r and r.get("evtok") == tok: ev_resolve(r)

@socketio.on("ev_vote")
def on_ev_vote(d):
    r = me()
    if r:
        r["evv"][request.sid] = int(d["idx"])
        if len(r["evv"]) == len(r["players"]): ev_resolve(r)
        else: push(r)

@socketio.on("finish")
def on_finish(d):
    r = me()
    if is_host(r): r["result"] = d["res"]; enter(r, 8); push(r)

@socketio.on("voice_on")
def on_voice_on(_=None):
    r = me()
    if not r: return []
    peers = [s for s in r["voice"] if s != request.sid]
    if request.sid not in r["voice"]: r["voice"].append(request.sid)
    return peers

@socketio.on("voice_off")
def on_voice_off(_=None):
    r = me()
    if r and request.sid in r["voice"]:
        r["voice"].remove(request.sid); emit("voice_left", request.sid, to=r["code"], include_self=False)

@socketio.on("rtc_signal")
def on_rtc(d): emit("rtc_signal", {"from": request.sid, "data": d["data"]}, to=d["to"])

@socketio.on("disconnect")
def on_disc():
    r = me()
    if not r: return
    sid = request.sid
    r["players"] = [p for p in r["players"] if p["sid"] != sid]; r["votes"].pop(sid, None)
    if sid in r["voice"]: r["voice"].remove(sid); emit("voice_left", sid, to=r["code"])
    if not r["players"]: rooms.pop(r["code"], None); return
    if r["host"] == sid:
        r["host"] = r["players"][0]["sid"]
    for i, p in enumerate(r["players"]): p["role"] = ROLES[i]
    push(r)
