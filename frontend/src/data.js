// Valores de simulação (estimativas educativas, não dados científicos validados).
export const MISSIONS = [
  { id: 1, name: "Exploração de Marte", desc: "Estudar a superfície de Marte e investigar vestígios de água.", diff: "Fácil", c: "#e0623a", planet: "🔴", budget: 2500, duration: "≈ 1 ano" },
  { id: 2, name: "Base científica na Lua", desc: "Estabelecer uma base para investigações científicas.", diff: "Fácil", c: "#aab4c8", planet: "🌙", budget: 3000, duration: "≈ 6 meses" },
  { id: 3, name: "Observação da Terra", desc: "Monitorizar alterações ambientais e climáticas no nosso planeta.", diff: "Média", c: "#3b8bff", planet: "🌍", budget: 1800, duration: "≈ 3 anos" },
  { id: 4, name: "Exploração de um asteróide", desc: "Investigar a composição de um asteróide e recolher amostras.", diff: "Média", c: "#8a7f72", planet: "☄️", budget: 2200, duration: "≈ 4 anos" },
  { id: 5, name: "Exploração de Júpiter", desc: "Estudar a atmosfera, as luas e o campo magnético de Júpiter.", diff: "Difícil", c: "#d99a5b", planet: "🪐", budget: 4500, duration: "≈ 6 anos" },
  { id: 6, name: "Exploração interestelar", desc: "Investigar o espaço para além da heliosfera.", diff: "Muito difícil", c: "#8b5cf6", planet: "🌌", budget: 6000, duration: "≈ 30 anos" },
];
export const DIFF_COLOR = { "Fácil": "#22e07a", "Média": "#ffb020", "Difícil": "#ff4d4d", "Muito difícil": "#ff2f6e" };
export const status = (p, id) => p.completed[id] ? "done" : (id === 1 || p.completed[id - 1]) ? "open" : "locked";
