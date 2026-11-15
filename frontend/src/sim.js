import { MGOALS } from "./catalog.js";
export const PHASES = [["prep", "Preparação da missão", 4], ["count", "Contagem decrescente", 10], ["launch", "Lançamento", 8], ["atmo", "Saída da atmosfera", 6], ["travel", "Viagem espacial", 30], ["arrive", "Chegada ao destino", 6], ["land", "Aterragem / inserção orbital", 8], ["science", "Operações científicas", 20], ["end", "Conclusão da missão", 4]];
export const TOTAL = 96, START = [0, 4, 14, 22, 28, 58, 64, 72, 92];
export const phaseAt = (t) => { let i = 8; while (i > 0 && t < START[i]) i--; return i; };
export const TRIP = { 1: [210, 401.3], 2: [4, 0.384], 3: [1, 0.0008], 4: [900, 620], 5: [1900, 2800], 6: [4000, 22000] }; // ilustrativo
export const RISK = { 1: .03, 2: .05, 3: .08, 4: .12, 5: .18, 6: .25 };
export const fmtT = (t, m) => { const d = t / TOTAL * TRIP[m.id][0], dd = Math.floor(d), h = Math.floor((d - dd) * 24), mi = Math.floor(((d - dd) * 24 - h) * 60); return `T+${String(dd).padStart(2, "0")}d ${String(h).padStart(2, "0")}h ${String(mi).padStart(2, "0")}m`; };
const E = (id, icon, t, d, res, opts, expl) => ({ id, icon, t, d, res, opts, expl });
export const EVENTS = [
  E("comm", "📡", "Falha de comunicação", "A antena principal perdeu o sinal com a Terra.", "c", [["Reiniciar o sistema e mudar para a antena de reserva", "good"], ["Reorientar a antena à mão, sem testes", "mid"], ["Ignorar e esperar que volte sozinho", "bad"]], "Sem comunicação não conseguimos enviar os dados. Há que repor o sinal com segurança."),
  E("power", "⚡", "Redução de energia", "Os painéis solares estão a produzir menos energia.", "e", [["Desligar temporariamente instrumentos não essenciais", "good"], ["Reduzir a velocidade de operação de tudo", "mid"], ["Manter tudo ligado", "bad"]], "Quando a energia baixa, convém poupar potência para os sistemas críticos."),
  E("inst", "🔧", "Falha de instrumento", "Um instrumento científico deixou de responder.", null, [["Reiniciar o instrumento e recalibrá-lo", "good"], ["Tentar apenas reiniciar", "mid"], ["Ignorar a avaria", "bad"]], "Um instrumento avariado reduz a nossa capacidade científica."),
  E("store", "🗄️", "Problema de armazenamento", "A memória de bordo está quase cheia.", "a", [["Transmitir dados prioritários e libertar espaço", "good"], ["Apagar dados antigos ao acaso", "mid"], ["Continuar a gravar sem libertar espaço", "bad"]], "Dados perdidos são ciência perdida. Prioriza o que é mais valioso."),
  E("disc", "💎", "Descoberta inesperada", "Os sensores detectaram uma formação invulgar!", null, [["Redireccionar instrumentos para estudar a descoberta", "good"], ["Tirar apenas algumas imagens", "mid"], ["Ignorar e seguir o plano", "bad"]], "Uma oportunidade científica adicional! Vale a pena investigar."),
  E("env", "🌪️", "Condições ambientais adversas", "Uma tempestade de poeira e radiação aproxima-se.", null, [["Pôr os instrumentos em modo de segurança", "good"], ["Continuar com precauções mínimas", "mid"], ["Prosseguir normalmente", "bad"]], "O ambiente pode danificar equipamento. Protege o que for sensível."),
];
const shuffle = (a) => a.sort(() => Math.random() - .5);
export function makeEvents(m, c, r) {
  const margin = (r.power - r.use) / r.power;
  const w = { comm: c.res.c <= 2 ? 3 : 1, power: margin < .25 ? 3 : 1, inst: 2, store: r.store < r.data * 15 ? 3 : 1, disc: 2, env: m.id >= 4 ? 3 : 1 };
  const slots = [[34, 46], [48, 57], [72, 72]], pool = [...EVENTS], n = m.id >= 4 ? 3 : 2, out = [];
  for (const si of n === 2 ? [0, 2] : [0, 1, 2]) {
    let x = Math.random() * pool.reduce((a, e) => a + w[e.id], 0), k = 0;
    for (; k < pool.length - 1; k++) { x -= w[pool[k].id]; if (x <= 0) break; }
    const e = pool.splice(k, 1)[0], [a, b] = slots[si];
    out.push({ ...e, at: a + Math.random() * (b - a), opts: shuffle([...e.opts]) });
  }
  return out;
}
export function apply(S, ev, q) {
  const k = { good: 0, mid: 1, bad: 2 }[q], dmg = [0, 15, 40][k], ids = Object.keys(S.hp).filter(i => S.hp[i] > 0);
  if (ev.res) S.res[ev.res] = Math.max(0, S.res[ev.res] - dmg);
  if (ev.id === "inst" && ids.length) S.hp[ids[Math.floor(Math.random() * ids.length)]] = [100, 50, 0][k];
  if (ev.id === "env") ids.forEach(i => S.hp[i] = Math.max(0, S.hp[i] - dmg));
  if (ev.id === "disc") S.discovery = [1, .5, 0][k];
  S.dec.push([1, .5, 0][k]); S.evlog.push([ev.t, q]);
}
const SCI = { imagem: "Imagens de alta resolução da superfície", composicao: "Composição do solo: minerais e óxidos", clima: "Variações de temperatura e atmosfera", subsolo: "Estruturas e gelo no subsolo", vida: "Moléculas orgânicas analisadas" };
/* FÓRMULA DE PONTUAÇÃO (máx. 10 500 × factor de resultado)
   Planeamento  (3000) = 3000 × (0,4·objectivos cobertos + 0,3·margem de energia + 0,3·eficiência orçamental)
   Simulação    (3500) = 3500 × (0,5·qualidade das decisões + 0,5·saúde final dos sistemas)
   Científicos  (3000) = 3000 × (objectivos operacionais / total) × factores de comunicação, armazenamento e energia
   Bónus        (1000) = 400·descoberta + 300 sem instrumentos perdidos + 300 se gastou ≤ 70% do orçamento
   Factor: sucesso total 1,0 · parcial 0,6 · fracasso 0,25 */
export function finish(S, m, c, r) {
  const need = MGOALS[m.id], goals = need.map(g => [g, !!(S.sam && S.sam[g])]);
  const cov = goals.filter(x => x[1]).length / need.length;
  const fac = (S.res.c >= 25 ? 1 : .6) * (S.res.a >= 25 ? 1 : .8) * (S.res.e >= 20 ? 1 : .8), sciPct = cov * fac;
  const outcome = S.failed ? "fail" : sciPct >= .75 ? "total" : sciPct >= .5 ? "partial" : "fail", mult = { total: 1, partial: .6, fail: .25 }[outcome];
  const margin = Math.max(0, Math.min(1, (r.power - r.use) / r.power / .3)), eff = Math.max(0, Math.min(1, (m.budget - r.cost) / m.budget / .4));
  const dec = S.dec.length ? S.dec.reduce((a, b) => a + b, 0) / S.dec.length : 1, hs = [...Object.values(S.hp), ...Object.values(S.res)], health = hs.reduce((a, b) => a + b, 0) / hs.length / 100;
  const lost = Object.values(S.hp).some(h => h < 50);
  const P = { plan: 3000 * (.4 * (r.got / need.length) + .3 * margin + .3 * eff), sim: 3500 * (.5 * dec + .5 * health), sci: 3000 * sciPct, bonus: 400 * S.discovery + (lost ? 0 : 300) + (r.cost <= .7 * m.budget ? 300 : 0) };
  const score = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, Math.round(v * mult)]));
  score.total = score.plan + score.sim + score.sci + score.bonus;
  const C = [];
  if (S.failed) C.push("Aumentar a margem de energia e o orçamento de segurança: as aterragens são arriscadas.");
  if (S.res.e < 50 || margin < .6) C.push("Aumentar a capacidade de energia (≥ 85%).");
  goals.filter(x => !x[1]).forEach(x => C.push(x[0] === "clima" ? "Incluir um instrumento de análise atmosférica e recolher a amostra." : "Recolher a amostra em falta (" + x[0] + "): poupa energia do rover e protege os instrumentos."));
  if (!need.every(g => r.ins.some(i => i.goals.includes(g)))) C.push("Cobrir todos os objectivos científicos com instrumentos adequados.");
  if (c.res.s < 4) C.push("Reservar mais suprimentos para imprevistos (≥ 80%).");
  if (S.res.c < 50) C.push("Reforçar a comunicação para não perder dados.");
  if (S.res.a < 50) C.push("Aumentar o armazenamento de bordo.");
  if (dec < .7) C.push("Ler com atenção as explicações do astronauta antes de decidir.");
  if (r.cost > .85 * m.budget) C.push("Poupar orçamento: compara custos antes de escolher.");
  C.push("Comparar as especificações antes de escolher.", "Consultar o Centro de Aprendizagem.", "Rever os requisitos da missão.");
  const [days, dist] = TRIP[m.id];
  return { outcome, cause: S.failed, score, stars: outcome === "fail" ? 1 : score.total >= 7500 ? 3 : score.total >= 4500 ? 2 : 1, goals: goals.map(([g, ok]) => ({ g, ok, text: SCI[g] })), allGoals: goals.every(x => x[1]), discovery: S.discovery, gb: Math.round((S.gb || 0) * 10) / 10, days, dist, resFinal: S.res, hp: S.hp, evlog: S.evlog, log: S.log, recs: [...new Set(C)].slice(0, 3), cost: r.cost, need: need.length };
}

export const LAND = [1, 2, 4];
export const POS = [[110, 70], [480, 60], [120, 190], [470, 190], [300, 120]];
export const targets = (m) => MGOALS[m.id].map((g, i) => ({ g, x: POS[i][0], y: POS[i][1] }));
