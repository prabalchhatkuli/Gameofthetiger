# Game of the Tiger (Bagchal)

Project hosted at : [gameoftiger.prabal.dev](https://gameoftiger.prabal.dev/).

please mention any bugs in the Issues section.

## Project Structure

- `frontend/` — React + Vite app
- `server/` — Express + Socket.io + MongoDB backend

## Prerequisites

- Node.js 18+
- A `server/.env` file with `ATLAS_URI=<your MongoDB connection string>`

## Development

Run the two modules in separate terminals:

```bash
# Terminal 1 — backend (Express + Socket.io on port 5000)
cd server
npm install
npm start

# Terminal 2 — frontend (Vite dev server on port 3000, with hot reload)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The Vite dev server proxies `/room` API calls and
`/socket.io` to the backend, so everything works from the one URL.

Equivalent root shortcuts: `npm run dev` (frontend) and `npm start` (server).
In VS Code, the **Run App (Frontend + Server)** task (Cmd+Shift+B) starts both.

## Production

In production a single Express process serves everything: the built frontend,
the room API, and the Socket.io connection.

```bash
# 1. Build the frontend (outputs to frontend/build)
cd frontend
npm install
npm run build

# 2. Start the server — it serves frontend/build as static files
cd ../server
npm install
npm start
```

Open http://localhost:5000. From the repo root, the same flow is
`npm run build && npm start`. On Heroku, the root `heroku-postbuild` script
runs the build automatically and `npm start` launches the server.
