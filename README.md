# Space Mission Design Game

### Engineering, Exploration & Interactive Storytelling

An interactive educational experience that combines space exploration, engineering, teamwork and storytelling.

Developed as part of a NASA-themed hackathon project.

---

## Overview

Space Mission Design Game is a web-based educational project designed to explore space missions through interactive scenarios, engineering challenges and collaborative experiences.

The project combines technical concepts with storytelling to make space exploration more engaging and accessible.

## Objectives

- Encourage interest in science, technology and engineering.
- Promote learning through interactive experiences.
- Explore space mission design concepts.
- Encourage collaboration and teamwork.
- Combine education, technology and storytelling.

## Key Features

- Interactive space mission experience.
- Multiplayer functionality.
- Room creation and access codes.
- Real-time communication.
- WebRTC voice communication.
- Interactive storytelling.
- Mission simulation and scoring.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Visual design and interface |
| JavaScript | Interactivity and simulation logic |
| Python | Backend development |
| Flask | Web server |
| Socket.IO | Real-time communication |
| WebRTC | Voice communication |
| Node.js & npm | Frontend development environment |

## System Architecture

The application follows a client-server architecture with separate frontend and backend components.

- **Frontend:** User interface, storytelling, mission simulation and interactions.
- **Backend:** Server-side functionality and real-time communication.
- **Socket.IO:** Communication between connected clients and the server.
- **WebRTC:** Voice communication between participants.

## Project Structure

```text
space-mission-design-game/
├── backend/
├── frontend/
├── documentation/
├── ABRIR-JOGO.bat
├── ABRIR-SERVIDOR.bat
├── STORYTELLING.txt
├── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Python
- Node.js
- npm
- A modern web browser

### 1. Clone the repository

```bash
git clone https://github.com/shaquilbrito/space-mission-design-game.git
cd space-mission-design-game
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs on port 5000.

### 3. Start the frontend

Open a separate terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs on port 5173.

### 4. Access the application

Open the following address in your browser:

```text
http://localhost:5173
```

## Multiplayer Experience

To explore multiplayer functionality:

1. Open the application in two or more browser tabs or windows.
2. Create a multiplayer room.
3. Share the room access code with other participants.
4. Join the room using the access code.
5. Explore the mission together.

Voice communication requires microphone permission.

## Live Demo

[Explore Space Mission Design Game](https://game.spacemission.earth)

## Future Improvements

- Expanded mission scenarios.
- Enhanced visual experience.
- Improved multiplayer interactions.
- Additional educational content.
- Mobile interface optimization.
- Accessibility and performance improvements.

## Project Status

Educational and experimental project.

## Developer Profile

**Shaquil Brito**

Computer Engineering Student at Eduardo Mondlane University (UEM), Mozambique.

- [GitHub](https://github.com/shaquilbrito)
- [LinkedIn](https://www.linkedin.com/in/shaquil-brito)

---

**Engineering · Creativity · Vision**

*Where Logic Meets Art.*
