// Música ambiente e efeitos gerados com Web Audio API (sem ficheiros externos).
let ctx, master, musicGain, timer, voices = [];
const cfg = () => ({ vol: .8, mus: .6, sfx: .9, mute: false, ...(() => { try { return JSON.parse(localStorage.getItem("smdg_settings")) || {}; } catch { return {}; } })() });
const ac = () => { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.connect(ctx.destination); } if (ctx.state === "suspended") ctx.resume(); master.gain.value = cfg().mute ? 0 : cfg().vol; return ctx; };
const CH = [[110, 164.8, 220, 261.6], [87.3, 130.8, 174.6, 220], [130.8, 196, 261.6, 329.6], [98, 146.8, 196, 246.9]];
export function music(on) {
  clearInterval(timer);
  if (!on) { voices.forEach(o => { try { o.stop(); } catch {} }); voices = []; return; }
  const c = ac(); musicGain = c.createGain(); musicGain.gain.value = .06 * cfg().mus * 2; musicGain.connect(master);
  const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900; f.connect(musicGain);
  voices = [0, 1, 2, 3].map(() => { const o = c.createOscillator(); o.type = "sawtooth"; o.detune.value = Math.random() * 12 - 6; o.connect(f); o.start(); return o; });
  let i = 0; const step = () => { CH[i++ % 4].forEach((hz, k) => voices[k].frequency.setTargetAtTime(hz, c.currentTime, 2)); }; step(); timer = setInterval(step, 8000);
}
export function sfx(kind) {
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain(), v = .15 * cfg().sfx, t = c.currentTime;
    const P = { count: [880, .12, "square"], alert: [520, .5, "sawtooth"], launch: [90, 2.5, "sawtooth"], ok: [660, .2, "sine"] }[kind] || [440, .1, "sine"];
    o.type = P[2]; o.frequency.setValueAtTime(P[0], t); if (kind === "launch") o.frequency.exponentialRampToValueAtTime(300, t + P[1]);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + P[1]); o.connect(g); g.connect(master); o.start(t); o.stop(t + P[1]);
  } catch {}
}
export const applyAudio = () => { if (master) master.gain.value = cfg().mute ? 0 : cfg().vol; };
