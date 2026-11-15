// Chamada de voz em malha (WebRTC); o servidor Flask-SocketIO só faz a sinalização.
export class Voice {
  constructor(socket) { this.s = socket; this.pc = {}; this.audio = {}; this.stream = null; this.h = ({ from, data }) => this.onSignal(from, data); this.l = (sid) => this.drop(sid); socket.on("rtc_signal", this.h); socket.on("voice_left", this.l); }
  async start() { this.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const peers = await new Promise(res => this.s.emit("voice_on", {}, res)); for (const sid of peers) await this.call(sid); }
  mk(sid) {
    if (this.pc[sid]) return this.pc[sid];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    this.stream?.getTracks().forEach(t => pc.addTrack(t, this.stream));
    pc.onicecandidate = e => e.candidate && this.s.emit("rtc_signal", { to: sid, data: { ice: e.candidate } });
    pc.ontrack = e => { const a = this.audio[sid] || (this.audio[sid] = new Audio()); a.autoplay = true; a.srcObject = e.streams[0]; };
    return (this.pc[sid] = pc);
  }
  async call(sid) { const pc = this.mk(sid); await pc.setLocalDescription(await pc.createOffer()); this.s.emit("rtc_signal", { to: sid, data: { sdp: pc.localDescription } }); }
  async onSignal(from, d) {
    if (!this.stream) return;
    const pc = this.mk(from);
    if (d.sdp) { await pc.setRemoteDescription(d.sdp); if (d.sdp.type === "offer") { await pc.setLocalDescription(await pc.createAnswer()); this.s.emit("rtc_signal", { to: from, data: { sdp: pc.localDescription } }); } }
    else if (d.ice) { try { await pc.addIceCandidate(d.ice); } catch {} }
  }
  drop(sid) { this.pc[sid]?.close(); delete this.pc[sid]; if (this.audio[sid]) { this.audio[sid].srcObject = null; delete this.audio[sid]; } }
  mute(on) { this.stream?.getAudioTracks().forEach(t => t.enabled = !on); }
  stop() { this.stream?.getTracks().forEach(t => t.stop()); this.stream = null; Object.keys(this.pc).forEach(s => this.drop(s)); this.s.emit("voice_off"); }
  destroy() { this.stop(); this.s.off("rtc_signal", this.h); this.s.off("voice_left", this.l); }
}
