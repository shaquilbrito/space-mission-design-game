import { MISSIONS } from "./data.js";
export const CAMPAIGN = [["m1", "Explorador de Marte", "🤖"], ["m2", "Pioneiro da Lua", "🌙"], ["m3", "Observador da Terra", "🛰️"], ["m4", "Caçador de Asteróides", "☄️"], ["m5", "Explorador de Júpiter", "🪐"], ["m6", "Explorador Interestelar", "🌌"]];
const n = (p) => Object.keys(p.completed).length;
export const ACH = [
  { id: "first", name: "Primeiro lançamento", desc: "Lança a tua primeira missão.", prog: p => [Math.min(1, p.history.length), 1] },
  { id: "explorer", name: "Explorador espacial", desc: "Conclui 3 missões.", prog: p => [Math.min(3, n(p)), 3] },
  { id: "manager", name: "Gestor de recursos", desc: "Conclui uma missão gastando até 80% do orçamento.", prog: p => [Math.min(1, p.history.filter(h => h.outcome !== "fail" && h.cost <= .8 * h.budget).length), 1] },
  { id: "scientist", name: "Cientista espacial", desc: "Cumpre todos os objectivos científicos de uma missão.", prog: p => [Math.min(1, p.history.filter(h => h.allGoals && h.outcome !== "fail").length), 1] },
  { id: "team", name: "Trabalho em equipa", desc: "Conclui uma missão em modo multiplayer.", prog: p => [Math.min(1, p.teamMissions || 0), 1] },
  { id: "master", name: "Mestre do universo", desc: "Conclui as 6 missões.", prog: p => [n(p), 6] },
];
export const earned = (p) => [...CAMPAIGN.filter(([id]) => p.completed[id.slice(1)]).map(x => x[0]), ...ACH.filter(a => { const [x, y] = a.prog(p); return x >= y; }).map(a => a.id)];
export function addResult(p, m, res) {
  const q = { ...p, completed: { ...p.completed }, history: [...p.history] }, date = new Date().toISOString().slice(0, 10);
  const e = { id: m.id, name: m.name, date, outcome: res.outcome, score: res.score.total, stars: res.stars, days: res.days, cost: res.cost, budget: m.budget, goals: res.goals.filter(g => g.ok).length, need: res.need, parts: res.score, allGoals: res.allGoals };
  q.history.unshift(e);
  if (res.outcome !== "fail" && (!q.completed[m.id] || q.completed[m.id].score < e.score)) q.completed[m.id] = { score: e.score, stars: e.stars, date, outcome: e.outcome, cost: e.cost };
  q.medals = earned(q); return q;
}
