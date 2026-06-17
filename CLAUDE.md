# CLAUDE.md

## Project Overview

**Game of the Tiger (Bagchal)** - An online multiplayer implementation of the traditional Nepali board game where 4 tigers compete against 20 goats on a 5x5 board.

- **Tigers win** by capturing 5 goats (jumping over them)
- **Goats win** by blocking all tigers from moving
- Supports single-player (vs computer), local two-player, and online multiplayer modes

**Live URL:** https://gameoftiger.prabal.dev/

## Tech Stack

**Frontend:**
- React 18.3
- Vite 5.4 (build tool)
- React Router 6
- Redux 5 / React-Redux 9
- Bootstrap 5.3 / React-Bootstrap 2.10
- Socket.io-client 4.7
- Firebase 10.13 (Auth + Firestore, modular API)
- TypeScript 5.5

**Backend:**
- Node.js 18+
- Express 4.19
- MongoDB / Mongoose 8.5
- Socket.io 4.7
- Pug 3 (template engine)

## Directory Structure

```
/
├── package.json                  # Root orchestration scripts (dev/build/start)
├── frontend/                     # React frontend module
│   ├── index.html                # Vite entry HTML
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # Frontend dependencies
│   ├── public/                   # Static assets & SVGs
│   └── src/
│       ├── index.jsx             # React 18 entry with createRoot
│       ├── App.jsx               # Main router (React Router v6)
│       ├── firebase.config.js    # Firebase v10 modular setup
│       ├── components/
│       │   ├── game/             # Core game logic
│       │   │   ├── game.component.jsx
│       │   │   ├── board.component.jsx
│       │   │   └── square.component.jsx
│       │   ├── piece/            # Game piece classes
│       │   │   ├── tigerpiece.component.js
│       │   │   └── goatpiece.component.js
│       │   ├── chat/             # Multiplayer components
│       │   │   ├── gameroom.component.jsx
│       │   │   └── multichoice.component.jsx
│       │   └── [navbar, login, signup, profile, etc.].jsx
│       └── providers/UserProvider.jsx
│
└── server/                       # Express backend module
    ├── bin/www                   # Entry point + Socket.io v4
    ├── app.js                    # Express config (pug views)
    ├── models/                   # Mongoose 8 schemas
    └── routes/room.js            # Room API endpoints
```

## Commands

```bash
# Development (from repo root)
npm run dev            # Start Vite dev server (port 3000)
npm start              # Start backend server (port 8000)

# Or work within each module directly
cd frontend && npm run dev
cd server && npm start

# Production
npm run build          # Build with Vite (outputs to /frontend/build)
cd frontend && npm run preview   # Preview production build
```

## Key Architecture

### React Router v6
Uses `<Routes>` and `element` prop instead of v5's `<Switch>` and `render`:
```jsx
<Routes>
  <Route path="/" element={<Landing userInfo={user} />} />
  <Route path="/room/:roomID" element={<GameRoom userInfo={user} />} />
</Routes>
```

### Firebase v10 Modular API
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
```

### Socket.io v4
Server uses `new Server()` constructor:
```javascript
const { Server } = require('socket.io');
const io = new Server(server, { cors: {...} });
```

### Socket Events
- `join` - Client joins room, receives chat history
- `SEND_MOVE` / `RECEIVE_MOVE` - Game state sync
- `SEND_MESSAGE` / `SEND_MESSAGE_ROOM` - Chat
- `GAME_OVER` - Client reports game result; server records win/loss in Firestore after both players report the same winner

### API Endpoints
- `POST /room/generate` - Create multiplayer room (requires `Authorization: Bearer <Firebase ID token>`)
- `POST /room/validateRoom` - Check room exists (public)
- `POST /room/joinRoom` - Join and get assigned piece (requires `Authorization: Bearer <Firebase ID token>`)

## Code Conventions

- **Components:** PascalCase with `.component.jsx` suffix
- **Documentation:** Custom JavaDoc-style comments (NAME, SYNOPSIS, DESCRIPTION, RETURNS, AUTHOR, DATE)
- **Game pieces:** Class-based (Piece, TigerPiece, GoatPiece) with `isMovePossible()` validation
- **Auth:** Firebase handles login; UserProvider context wraps app

## Important Files

| File | Purpose |
|------|---------|
| `frontend/src/components/game/game.component.jsx` | Core game logic, move validation, win conditions |
| `frontend/src/firebase.config.js` | Firebase v10 initialization and auth helpers |
| `frontend/src/providers/UserProvider.jsx` | Auth context provider |
| `server/bin/www` | Server entry with Socket.io v4 |
| `server/routes/room.js` | Multiplayer room management |
| `frontend/vite.config.js` | Vite build config with proxy settings |

## Database

**MongoDB (via Mongoose 8):**
- `chatRooms` - Room ID, creator, pieces assignment, winner
- `chatMessages` - Chat history per room

**Firebase Firestore:**
- `users/{uid}` - Profile data, wins, losses

## Environment

- Backend expects `ATLAS_URI` in `server/.env` for MongoDB connection
- Firebase config is in `frontend/src/firebase.config.js`
- Dev server: port 3000 (Vite), port 8000 (Express)
- Vite proxies `/room` and `/socket.io` to backend in development
- Backend also expects `FIREBASE_SERVICE_ACCOUNT` in `server/.env` (service account JSON, single line) for token verification and server-side stat writes
- Sockets require a Firebase ID token via the Socket.io `auth` payload
