# Space Mission Design Game — Fases 1 a 4
1. Backend:  cd backend && pip install -r requirements.txt && python app.py      (porta 5000, Flask + SocketIO)
2. Frontend: cd frontend && npm install && npm run dev                          (porta 5173)
Multiplayer: abre o jogo em 2+ separadores/browsers, cria a sala num e entra com o código nos outros.
Voz (WebRTC): precisa de permissão de microfone; em rede local funciona sem servidor extra (STUN público).
Pontuação: ver comentário em frontend/src/sim.js.
