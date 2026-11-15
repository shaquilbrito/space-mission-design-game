import json, secrets, sqlite3, os
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from mp import socketio
from werkzeug.security import generate_password_hash, check_password_hash

DB = os.path.join(os.path.dirname(__file__), "smdg.db")
app = Flask(__name__)
CORS(app)
socketio.init_app(app)

def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB); g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close(_):
    d = g.pop("db", None)
    if d: d.close()

def init():
    c = sqlite3.connect(DB)
    c.executescript("""
    CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, nick TEXT UNIQUE NOT NULL COLLATE NOCASE,
      pw TEXT NOT NULL, token TEXT, progress TEXT DEFAULT '{}', settings TEXT DEFAULT '{}');
    """); c.commit(); c.close()

def user_from_token():
    t = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not t: return None
    return db().execute("SELECT * FROM users WHERE token=?", (t,)).fetchone()

def public(u):
    return {"nick": u["nick"], "progress": json.loads(u["progress"]), "settings": json.loads(u["settings"])}

@app.post("/api/register")
def register():
    d = request.json or {}
    nick, pw = (d.get("nick") or "").strip(), d.get("password") or ""
    if not (3 <= len(nick) <= 20) or not nick.replace("_", "").isalnum():
        return jsonify(error="A alcunha deve ter 3-20 caracteres (letras, números, _)."), 400
    if len(pw) < 6: return jsonify(error="A palavra-passe deve ter pelo menos 6 caracteres."), 400
    tok = secrets.token_hex(24)
    try:
        db().execute("INSERT INTO users(nick,pw,token) VALUES(?,?,?)", (nick, generate_password_hash(pw), tok))
        db().commit()
    except sqlite3.IntegrityError:
        return jsonify(error="Esta alcunha já está em uso."), 409
    return jsonify(token=tok, user=public(user_from_token_by(tok)))

def user_from_token_by(tok):
    return db().execute("SELECT * FROM users WHERE token=?", (tok,)).fetchone()

@app.post("/api/login")
def login():
    d = request.json or {}
    u = db().execute("SELECT * FROM users WHERE nick=?", ((d.get("nick") or "").strip(),)).fetchone()
    if not u or not check_password_hash(u["pw"], d.get("password") or ""):
        return jsonify(error="Alcunha ou palavra-passe incorrecta."), 401
    tok = secrets.token_hex(24)
    db().execute("UPDATE users SET token=? WHERE id=?", (tok, u["id"])); db().commit()
    return jsonify(token=tok, user=public(user_from_token_by(tok)))

@app.get("/api/me")
def me():
    u = user_from_token()
    return (jsonify(user=public(u)) if u else (jsonify(error="Sessão inválida."), 401))

@app.put("/api/progress")
def save_progress():
    u = user_from_token()
    if not u: return jsonify(error="Sessão inválida."), 401
    db().execute("UPDATE users SET progress=? WHERE id=?", (json.dumps(request.json or {}), u["id"])); db().commit()
    return jsonify(ok=True)

@app.put("/api/settings")
def save_settings():
    u = user_from_token()
    if not u: return jsonify(error="Sessão inválida."), 401
    db().execute("UPDATE users SET settings=? WHERE id=?", (json.dumps(request.json or {}), u["id"])); db().commit()
    return jsonify(ok=True)

if __name__ == "__main__":
    init(); socketio.run(app, port=5000, debug=True, allow_unsafe_werkzeug=True)
