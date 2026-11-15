// Progresso: convidado -> localStorage; conta -> API Flask.
const K = "smdg_session";
export const getSession = () => { try { return JSON.parse(localStorage.getItem(K)); } catch { return null; } };
export const setSession = (s) => s ? localStorage.setItem(K, JSON.stringify(s)) : localStorage.removeItem(K);
export const emptyProgress = () => ({ completed: {}, medals: [], history: [] });

export async function api(path, method = "GET", body, token) {
  const r = await fetch("/api" + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Erro de ligação ao servidor.");
  return d;
}
export const saveProgress = (s, p) => s.guest ? setSession({ ...s, user: { ...s.user, progress: p } }) : api("/progress", "PUT", p, s.token);
