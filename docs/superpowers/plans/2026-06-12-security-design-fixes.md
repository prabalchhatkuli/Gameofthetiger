# Security & Design Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the six design issues in Game of the Tiger: broken React Router `Redirect` imports, Express route-ordering landmine, dead ACME route, the `setWinLoss` read-then-write race, the unauthenticated `/room` API and sockets, and client-trusted win/loss reporting.

**Architecture:** Frontend fixes are surgical (delete dead imports, atomic Firestore increment). The server gains a Firebase Admin SDK integration: an Express middleware verifies Firebase ID tokens on room endpoints, a Socket.io middleware authenticates socket connections, and a new `GAME_OVER` flow makes the *server* write win/loss stats to Firestore (via Admin SDK, which bypasses security rules) only after **both** room participants report the same winner. Client-side Firestore stat writes are then removed entirely and locked out by Firestore security rules.

**Explicit non-goal (documented future work):** full server-side move validation (replaying the game engine on the server). After this plan, a result still originates from clients, but: only authenticated room participants can report, both must agree, a room's result can be recorded only once, and clients can no longer write stats to Firestore at all.

**Tech Stack:** React 18 + Vite (frontend), Express 4 + Socket.io 4 + Mongoose 8 (server), Firebase Auth + Firestore (client SDK v10, new `firebase-admin` on server), Jest for new server tests.

**Repo layout reminder:** frontend lives in `frontend/`, backend in `server/`. There is no frontend test runner configured; frontend tasks are verified with `npm run build` and manual smoke steps (adding Vitest for two-line fixes is out of scope). Server tests use Jest, added in Task 4.

**Prerequisite for Tasks 5–9:** a Firebase service account key (manual step, instructions in Task 5). Tasks 1–4 have no external dependencies — do them first regardless.

---

### Task 1: Remove broken `Redirect` imports (frontend)

`Redirect` was removed in React Router v6. Two files still import it (build warns `"Redirect" is not exported`), and it would throw at runtime. Neither file actually *uses* `Redirect` — they redirect via `window.location.href` — so the fix is deleting the imports. `winner.component.jsx` also imports `ReactDOM` without using it.

**Files:**
- Modify: `frontend/src/components/game/winner.component.jsx:2-4`
- Modify: `frontend/src/components/chat/multichoice.component.jsx:4`

- [ ] **Step 1: Confirm the warnings exist (this is the "failing test")**

Run: `cd frontend && npm run build 2>&1 | grep Redirect`
Expected output (two lines):
```
src/components/game/winner.component.jsx (4:9): "Redirect" is not exported by "node_modules/react-router-dom/dist/index.js", ...
src/components/chat/multichoice.component.jsx (4:9): "Redirect" is not exported by ...
```

- [ ] **Step 2: Fix `winner.component.jsx`**

Replace lines 1–4:
```jsx
import React, { Component, useContext,useState } from 'react'
import ReactDOM from 'react-dom'
import { UserContext } from "../../providers/UserProvider";
import { Redirect } from "react-router-dom";
```
with:
```jsx
import React, { Component, useContext,useState } from 'react'
import { UserContext } from "../../providers/UserProvider";
```

- [ ] **Step 3: Fix `multichoice.component.jsx`**

Delete line 4 only (this file *does* use `ReactDOM.render`, keep that import):
```jsx
import { Redirect } from "react-router-dom";
```

- [ ] **Step 4: Verify the build is clean**

Run: `cd frontend && npm run build 2>&1 | grep Redirect ; echo "exit: $?"`
Expected: no matches, `exit: 1` (grep found nothing). Build itself must end with `✓ built in ...`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/game/winner.component.jsx frontend/src/components/chat/multichoice.component.jsx
git commit -m "fix: remove Redirect imports removed in React Router v6"
```

---

### Task 2: Fix Express route order, delete dead ACME route and legacy index router (server)

Today `server/app.js` registers the SPA catch-all `app.get("*")` *before* the routers; it works only because the room API is all-POST. There's also a hardcoded ACME-challenge route from an old cert issuance, and a legacy Express-generator `indexRouter` that renders a Pug page nobody should see (the catch-all currently shadows it — if we just moved the catch-all down, `GET /` would start serving the Pug page instead of the React app).

**Files:**
- Modify: `server/app.js`

- [ ] **Step 1: Rewrite the middleware/route section of `server/app.js`**

Delete these pieces:
1. Line 14: `var indexRouter = require('./routes/index');`
2. The block from `// ... other app.use middleware` down to `//---------------------------------------------------` (the duplicated static mount stays — see below — but the ACME route and the early catch-all go)
3. Line 54: `app.use('/', indexRouter);`

The section between the mongoose connection and the 404 handler must end up exactly like this:

```javascript
// serve the built frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

//routers
app.use('/room', roomRouter);

// SPA fallback: all remaining GETs get the React app (must stay below the routers)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

Also delete line 15's now-unused require if it references `./routes/index` (keep `roomRouter`). Do **not** delete `server/routes/index.js` from disk yet if other code imports it — verify with `grep -rn "routes/index" server --include="*.js" | grep -v node_modules`; if only `app.js` referenced it, delete `server/routes/index.js` too.

- [ ] **Step 2: Verify manually**

Run (terminal 1): `cd server && npm start`
Run (terminal 2):
```bash
curl -s -X POST http://localhost:5000/room/validateRoom -H 'Content-Type: application/json' -d '{"roomID":"nosuchroom"}'
```
Expected: `{"isRoomValid":false}` (the API still works).
```bash
curl -s http://localhost:5000/ | head -2
```
Expected: the React `index.html` (starts with `<!doctype html>`), **not** a Pug-rendered page. (Requires `frontend/build` to exist — run `cd frontend && npm run build` first if needed.)
```bash
curl -s http://localhost:5000/room/anyroomid | head -2
```
Expected: also the React `index.html` (SPA route for the room page is a GET, handled by the catch-all).

- [ ] **Step 3: Commit**

```bash
git add server/app.js
git rm -q server/routes/index.js 2>/dev/null || true
git commit -m "fix: move SPA catch-all below routers, drop ACME route and legacy index router"
```

---

### Task 3: Make `setWinLoss` atomic with Firestore `increment()` (frontend)

Current code reads the doc then writes `wins + win`, which loses an update if two writes race. Firestore has a server-side atomic `increment()`.

*Note: Task 9 moves stat-writing to the server and deletes this function entirely. This task is kept so the codebase is correct at every commit even if execution stops here — it's a 3-line change.*

**Files:**
- Modify: `frontend/src/firebase.config.js:2` (import) and `:180-190` (function body)

- [ ] **Step 1: Add `increment` to the firestore import**

Replace line 2:
```javascript
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
```
with:
```javascript
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
```

- [ ] **Step 2: Replace the body of `setWinLoss`**

Replace:
```javascript
export const setWinLoss = async (win, loss, uid) => {
    // Get the document reference
    const userRef = doc(firestore, `users/${uid}`);
    // Retrieve initial user info
    const userDocument = await getDoc(userRef);
    // Update
    await updateDoc(userRef, {
        wins: userDocument.data().wins + win,
        losses: userDocument.data().losses + loss
    });
};
```
with:
```javascript
export const setWinLoss = async (win, loss, uid) => {
    const userRef = doc(firestore, `users/${uid}`);
    // atomic server-side increment; no read-modify-write race
    await updateDoc(userRef, {
        wins: increment(win),
        losses: increment(loss)
    });
};
```
(Keep the JavaDoc-style comment block above the function; the codebase convention is to document every function that way.)

- [ ] **Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: `✓ built` with no new warnings.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/firebase.config.js
git commit -m "fix: use atomic Firestore increment in setWinLoss"
```

---

### Task 4: Add Jest test infrastructure to the server

The server has zero tests. Tasks 6 and 9 are developed test-first, so set up Jest now.

**Files:**
- Modify: `server/package.json`
- Create: `server/tests/sanity.test.js` (deleted again in Task 6 once a real test exists — it only proves the runner works)

- [ ] **Step 1: Install Jest**

Run: `cd server && npm install --save-dev jest`

- [ ] **Step 2: Add the test script**

In `server/package.json`, change the scripts block to:
```json
  "scripts": {
    "start": "node ./bin/www",
    "test": "jest"
  },
```

- [ ] **Step 3: Write a sanity test**

Create `server/tests/sanity.test.js`:
```javascript
test('jest runs', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 4: Run it**

Run: `cd server && npm test`
Expected: `Tests: 1 passed, 1 total`

- [ ] **Step 5: Commit**

```bash
git add server/package.json server/package-lock.json server/tests/sanity.test.js
git commit -m "test: add jest infrastructure to server"
```

---

### Task 5: Firebase Admin SDK initialization (server)

The server needs Admin SDK credentials to verify ID tokens and write Firestore stats. Credentials come from a service account key stored as a JSON string in the `FIREBASE_SERVICE_ACCOUNT` env var (works with `server/.env` locally via the existing `dotenv` setup, and as a Heroku config var in production). `server/.env` is already gitignored.

**Files:**
- Create: `server/firebaseAdmin.js`
- Modify: `server/.env` (manual, never committed)

- [ ] **Step 1 (MANUAL — needs the project owner): obtain a service account key**

1. Open https://console.firebase.google.com/ → project `gameoftiger-1f3fa` → Project settings → Service accounts.
2. Click "Generate new private key", download the JSON file. **Do not commit it anywhere.**
3. Collapse it to one line and add to `server/.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"gameoftiger-1f3fa",...}
   ```
   (One-liner to produce it: `node -e "console.log('FIREBASE_SERVICE_ACCOUNT=' + JSON.stringify(require('/path/to/downloaded-key.json')))"`)
4. For production, set the same value: `heroku config:set FIREBASE_SERVICE_ACCOUNT='...'` (or the equivalent in whatever hosts gameoftiger.prabal.dev).

- [ ] **Step 2: Install firebase-admin**

Run: `cd server && npm install firebase-admin`

- [ ] **Step 3: Create `server/firebaseAdmin.js`**

```javascript
const admin = require('firebase-admin');

// Initialized once at startup; FIREBASE_SERVICE_ACCOUNT holds the service
// account JSON as a single-line string (set in server/.env locally).
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
```

- [ ] **Step 4: Verify it initializes**

Run: `cd server && node -e "require('dotenv').config(); require('./firebaseAdmin'); console.log('admin OK')"`
Expected: `admin OK` (will throw if the env var is missing or malformed JSON).

- [ ] **Step 5: Commit**

```bash
git add server/firebaseAdmin.js server/package.json server/package-lock.json
git commit -m "feat: add firebase-admin initialization module"
```

---

### Task 6: Token-verifying auth middleware (server, TDD)

Express middleware that requires `Authorization: Bearer <Firebase ID token>`, verifies it with the Admin SDK, and attaches the decoded token as `req.user`.

**Files:**
- Create: `server/middleware/auth.js`
- Create: `server/tests/auth.test.js`
- Delete: `server/tests/sanity.test.js`

- [ ] **Step 1: Write the failing tests**

Create `server/tests/auth.test.js`:
```javascript
// jest.mock factories may only reference names prefixed with "mock"
const mockVerifyIdToken = jest.fn();
jest.mock('../firebaseAdmin', () => ({
    auth: () => ({ verifyIdToken: mockVerifyIdToken })
}));

const requireAuth = require('../middleware/auth');

function makeRes() {
    const res = { statusCode: null, body: null };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (body) => { res.body = body; return res; };
    return res;
}

beforeEach(() => mockVerifyIdToken.mockReset());

test('rejects request with no Authorization header', async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
});

test('rejects request with invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('bad token'));
    const req = { headers: { authorization: 'Bearer garbage' } };
    const res = makeRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
});

test('attaches decoded token as req.user and calls next on valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'abc123', email: 'p@x.com' });
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = makeRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('goodtoken');
    expect(req.user).toEqual({ uid: 'abc123', email: 'p@x.com' });
    expect(next).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `cd server && npm test`
Expected: FAIL — `Cannot find module '../middleware/auth'`

- [ ] **Step 3: Implement the middleware**

Create `server/middleware/auth.js`:
```javascript
const admin = require('../firebaseAdmin');

/**/
/*
requireAuth()

NAME
        requireAuth - Express middleware verifying a Firebase ID token

SYNOPSIS
        requireAuth(req, res, next)
            req     -> must carry "Authorization: Bearer <idToken>"
            res     -> 401 JSON response on missing/invalid token
            next    -> called when the token verifies

DESCRIPTION
        Verifies the Firebase ID token with the Admin SDK and attaches the
        decoded token (uid, email, ...) to req.user.

RETURNS
        no return; either responds 401 or calls next()

AUTHOR
        Prabal Chhatkuli
*/
/**/
async function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    try {
        req.user = await admin.auth().verifyIdToken(match[1]);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = requireAuth;
```

- [ ] **Step 4: Run tests, confirm they pass; delete the sanity test**

Run: `cd server && npm test`
Expected: `Tests: 3 passed` (4 if sanity not yet deleted). Then: `rm server/tests/sanity.test.js` and re-run — `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add server/middleware/auth.js server/tests/auth.test.js
git rm -q server/tests/sanity.test.js
git commit -m "feat: add Firebase ID token auth middleware with tests"
```

---

### Task 7: Protect /room endpoints; clients send ID tokens; rooms store uids

Apply `requireAuth` to `/room/generate` and `/room/joinRoom` (`/room/validateRoom` stays public — read-only existence check used before login is confirmed). Server stops trusting identity from the request body and uses the verified token instead. Rooms additionally store each player's Firebase `uid` — Task 9 needs them to credit stats.

**Files:**
- Modify: `server/models/chatrooms.model.js`
- Modify: `server/routes/room.js`
- Modify: `frontend/src/components/chat/multichoice.component.jsx`
- Modify: `frontend/src/components/chat/gameroom.component.jsx`

- [ ] **Step 1: Add uid + result-reporting fields to the room schema**

In `server/models/chatrooms.model.js`, replace the schema fields with:
```javascript
const chatRoomsSchema = new Schema({
        "name":{type: String,default: '-'},
        "creator":{type:String, default:'-'},
        "creator_uid":{type:String, default:'-'},
        "creator_piece":{type:String, default:'-'},
        "joiner":{type:String, default:'-'},
        "joiner_uid":{type:String, default:'-'},
        "winner":{type:String, default:'-'},
        "reported_winner":{type:String, default:'-'},
        "reported_by":{type:String, default:'-'}
    },
    {
        timestamps:true
    }
)
```
(`reported_winner`/`reported_by` are used by Task 9; adding them in the same schema edit avoids touching this file twice.)

- [ ] **Step 2: Protect the routes and use the verified identity**

In `server/routes/room.js`:

Add at the top (below the model requires):
```javascript
const requireAuth = require('../middleware/auth');
```

In `generateRoomID`, replace the `insertMany` line with:
```javascript
  await chatrooms.insertMany([{
    name: roomID,
    creator: req.user.email,
    creator_uid: req.user.uid,
    creator_piece: req.body.piece
  }]);
```

In `joinRoom`, replace every use of `req.body.userInfo` with `req.user.email`, and in the branch that claims the joiner slot (`listOfRooms[0].joiner === '-'`), replace the two update lines with:
```javascript
        listOfRooms[0].joiner = req.user.email;
        listOfRooms[0].joiner_uid = req.user.uid;
        await listOfRooms[0].save();
```

Replace the route registrations at the bottom with:
```javascript
router.post('/joinRoom', requireAuth, joinRoom);

router.post('/validateRoom', validateRoom);

router.post('/generate', requireAuth, generateRoomID);
```

- [ ] **Step 3: Send the token from `multichoice.component.jsx`**

Add to the imports:
```javascript
import { auth } from "../../firebase.config";
```

In `onGenerateButtonClick`, replace:
```javascript
        let payload={piece:this.state.playerPiece, user: this.state.userInfo.email};
        try
        {
            const response = await axios.post('/room/generate',payload);
```
with:
```javascript
        let payload={piece:this.state.playerPiece};
        try
        {
            const token = await auth.currentUser.getIdToken();
            const response = await axios.post('/room/generate', payload,
                { headers: { Authorization: `Bearer ${token}` } });
```

- [ ] **Step 4: Send the token from `gameroom.component.jsx`**

Add to the imports:
```javascript
import { auth } from "../../firebase.config";
```

In `startGame()`, replace:
```javascript
            const payload = { roomID: roomID, userInfo: userInfo.email };

            try {
                const response = await axios.post('/room/joinRoom', payload);
```
with:
```javascript
            const payload = { roomID: roomID };

            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.post('/room/joinRoom', payload,
                    { headers: { Authorization: `Bearer ${token}` } });
```

- [ ] **Step 5: Verify**

1. `cd frontend && npm run build` — expect clean build.
2. Unauthenticated requests are rejected:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/room/generate -H 'Content-Type: application/json' -d '{"piece":"goat"}'
   ```
   Expected: `401`
3. Full smoke test: run server + `cd frontend && npm run dev`, sign in with Google, create a room from the multiplayer modal, open the room link in a second browser/profile signed in as a different user, and confirm both players get pieces. Check MongoDB (`chatrooms` collection) that the new room has `creator_uid` and `joiner_uid` populated.

- [ ] **Step 6: Commit**

```bash
git add server/models/chatrooms.model.js server/routes/room.js frontend/src/components/chat/multichoice.component.jsx frontend/src/components/chat/gameroom.component.jsx
git commit -m "feat: require Firebase auth on room create/join, store player uids"
```

---

### Task 8: Authenticate Socket.io connections

The only socket in the app is created in `game.component.jsx` (`socket: io('/')`), which renders strictly behind the login check in `gameroom.component.jsx` — so the socket connection can hard-require a token. The client supplies it via Socket.io v4's `auth` callback (called on every (re)connect, so a refreshed token is always used); the server verifies it in an `io.use()` middleware and stores the decoded token on `socket.user`.

**Files:**
- Modify: `frontend/src/components/game/game.component.jsx` (constructor, ~line 86)
- Modify: `server/bin/www`

- [ ] **Step 1: Client supplies the token**

In `frontend/src/components/game/game.component.jsx`, change the firebase import (line 10) from:
```javascript
import {setWinLoss}from '../../firebase.config'
```
to:
```javascript
import { setWinLoss, auth } from '../../firebase.config'
```
(`setWinLoss` is still used until Task 9 removes it.)

In the constructor, replace:
```javascript
            socket:io('/')
```
with:
```javascript
            socket:io('/', {
                auth: (cb) => {
                    // called on every (re)connect; sends a fresh ID token
                    if (auth.currentUser) {
                        auth.currentUser.getIdToken().then(token => cb({ token }));
                    } else {
                        cb({});
                    }
                }
            })
```

- [ ] **Step 2: Server verifies the token**

In `server/bin/www`, below the `const io = new Server(...)` block and above `io.on('connection', ...)`, add:
```javascript
const admin = require('../firebaseAdmin');

// Reject sockets without a valid Firebase ID token; attach the decoded
// token so event handlers know who is connected.
io.use(async (socket, next) => {
  try {
    socket.user = await admin.auth().verifyIdToken(socket.handshake.auth.token);
    next();
  } catch (err) {
    next(new Error('unauthorized'));
  }
});
```

- [ ] **Step 3: Verify manually**

1. Start server and frontend dev server.
2. Signed in: open a game room — chat and moves work (check the server log prints `a user connected: <id>`).
3. Not signed in, simulate a raw connection:
   ```bash
   node -e "
   const { io } = require('socket.io-client');
   const s = io('http://localhost:5000', { auth: {} });
   s.on('connect', () => { console.log('UNEXPECTED connect'); process.exit(1); });
   s.on('connect_error', (e) => { console.log('rejected:', e.message); process.exit(0); });
   " 
   ```
   (run from `frontend/` so `socket.io-client` resolves)
   Expected: `rejected: unauthorized`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/game/game.component.jsx server/bin/www
git commit -m "feat: require Firebase auth on socket connections"
```

---

### Task 9: Server-side game result recording (TDD)

The core fix. A new `GAME_OVER` socket event replaces client-side Firestore writes. The server commits a result only when **both** room participants report the same winner, exactly once per room, and writes the stats itself via the Admin SDK (`FieldValue.increment`, atomic). The client's `setWinLoss` function and all its call sites are deleted.

Flow: each client already learns the winner independently (the sender computes it in `sendMoves()`; the receiver gets it in `RECEIVE_MOVE`). Both emit `GAME_OVER {roomID, winner}`. First report is parked on the room doc (`reported_winner`/`reported_by`, added in Task 7); a matching report from the *other* participant commits.

**Files:**
- Create: `server/services/gameResult.js`
- Create: `server/tests/gameResult.test.js`
- Modify: `server/bin/www` (SEND_MOVE handler + new GAME_OVER handler)
- Modify: `frontend/src/components/game/game.component.jsx` (remove setWinLoss calls, emit GAME_OVER)
- Modify: `frontend/src/firebase.config.js` (delete setWinLoss)

- [ ] **Step 1: Write the failing tests**

Create `server/tests/gameResult.test.js`:
```javascript
const mockFindOne = jest.fn();
jest.mock('../models/chatrooms.model', () => ({ findOne: mockFindOne }));

const mockDocUpdate = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn(() => ({ update: mockDocUpdate }));
const mockIncrement = jest.fn((n) => ({ __increment: n }));
jest.mock('../firebaseAdmin', () => {
    const firestore = () => ({ doc: mockDoc });
    firestore.FieldValue = { increment: mockIncrement };
    return { firestore };
});

const { recordGameResult } = require('../services/gameResult');

function makeRoom(overrides) {
    return Object.assign({
        name: 'room01',
        creator_uid: 'uid-creator',
        joiner_uid: 'uid-joiner',
        creator_piece: 'tiger',
        winner: '-',
        reported_winner: '-',
        reported_by: '-',
        save: jest.fn().mockResolvedValue(undefined)
    }, overrides);
}

beforeEach(() => {
    mockFindOne.mockReset();
    mockDoc.mockClear();
    mockDocUpdate.mockClear();
});

test('unknown room is rejected', async () => {
    mockFindOne.mockResolvedValue(null);
    const result = await recordGameResult('nope', 'T', 'uid-creator');
    expect(result.status).toBe('no-room');
});

test('non-participant cannot report', async () => {
    mockFindOne.mockResolvedValue(makeRoom());
    const result = await recordGameResult('room01', 'T', 'uid-stranger');
    expect(result.status).toBe('not-a-player');
});

test('first report is parked, no stats written', async () => {
    const room = makeRoom();
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('awaiting-confirmation');
    expect(room.reported_winner).toBe('T');
    expect(room.reported_by).toBe('uid-creator');
    expect(room.save).toHaveBeenCalled();
    expect(mockDoc).not.toHaveBeenCalled();
});

test('same player reporting twice does not commit', async () => {
    const room = makeRoom({ reported_winner: 'T', reported_by: 'uid-creator' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('duplicate-report');
    expect(mockDoc).not.toHaveBeenCalled();
});

test('matching second report commits: winner gets a win, loser a loss', async () => {
    // creator played tiger and tiger won => creator is the winner
    const room = makeRoom({ reported_winner: 'T', reported_by: 'uid-joiner' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('recorded');
    expect(room.winner).toBe('T');
    expect(mockDoc).toHaveBeenCalledWith('users/uid-creator');
    expect(mockDoc).toHaveBeenCalledWith('users/uid-joiner');
    const updates = mockDocUpdate.mock.calls.map(c => c[0]);
    expect(updates).toContainEqual({ wins: { __increment: 1 } });
    expect(updates).toContainEqual({ losses: { __increment: 1 } });
});

test('conflicting reports reset the pending report', async () => {
    const room = makeRoom({ reported_winner: 'T', reported_by: 'uid-joiner' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'G', 'uid-creator');
    expect(result.status).toBe('mismatch');
    expect(room.reported_winner).toBe('-');
    expect(room.reported_by).toBe('-');
    expect(mockDoc).not.toHaveBeenCalled();
});

test('finished room cannot be re-reported', async () => {
    const room = makeRoom({ winner: 'T' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('already-recorded');
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `cd server && npm test`
Expected: FAIL — `Cannot find module '../services/gameResult'`

- [ ] **Step 3: Implement the service**

Create `server/services/gameResult.js`:
```javascript
const chatrooms = require('../models/chatrooms.model');
const admin = require('../firebaseAdmin');

/**/
/*
recordGameResult()

NAME
        recordGameResult - commit a game result once both players agree

SYNOPSIS
        recordGameResult(roomID, winner, reporterUid)
            roomID       -> room name in the chatrooms collection
            winner       -> 'T' or 'G'
            reporterUid  -> verified Firebase uid of the reporting socket

DESCRIPTION
        First report from a participant is parked on the room document.
        When the *other* participant reports the same winner, the result is
        committed: the room's winner field is set (locking the room) and
        both players' Firestore stats are updated atomically via the Admin
        SDK. Conflicting reports clear the pending report. A room with a
        recorded winner never accepts another report.

RETURNS
        { status } where status is one of: no-room, not-a-player,
        already-recorded, awaiting-confirmation, duplicate-report,
        mismatch, recorded

AUTHOR
        Prabal Chhatkuli
*/
/**/
async function recordGameResult(roomID, winner, reporterUid) {
    const room = await chatrooms.findOne({ name: roomID });
    if (!room) return { status: 'no-room' };
    if (room.winner !== '-') return { status: 'already-recorded' };

    const isParticipant = reporterUid === room.creator_uid || reporterUid === room.joiner_uid;
    if (!isParticipant) return { status: 'not-a-player' };

    if (room.reported_by === '-') {
        room.reported_winner = winner;
        room.reported_by = reporterUid;
        await room.save();
        return { status: 'awaiting-confirmation' };
    }

    if (room.reported_by === reporterUid) return { status: 'duplicate-report' };

    if (room.reported_winner !== winner) {
        room.reported_winner = '-';
        room.reported_by = '-';
        await room.save();
        return { status: 'mismatch' };
    }

    // both participants agree: lock the room, then credit the stats
    room.winner = winner;
    await room.save();

    const creatorWon = winner === (room.creator_piece === 'tiger' ? 'T' : 'G');
    const winnerUid = creatorWon ? room.creator_uid : room.joiner_uid;
    const loserUid = creatorWon ? room.joiner_uid : room.creator_uid;

    const db = admin.firestore();
    const { increment } = admin.firestore.FieldValue;
    await Promise.all([
        db.doc(`users/${winnerUid}`).update({ wins: increment(1) }),
        db.doc(`users/${loserUid}`).update({ losses: increment(1) })
    ]);

    return { status: 'recorded', winnerUid, loserUid };
}

module.exports = { recordGameResult };
```

- [ ] **Step 4: Run tests, confirm they pass**

Run: `cd server && npm test`
Expected: `Tests: 10 passed` (3 auth + 7 gameResult)

- [ ] **Step 5: Wire up the socket event in `server/bin/www`**

Add to the requires at the top (next to the model requires):
```javascript
const { recordGameResult } = require('../services/gameResult');
```

In the `SEND_MOVE` handler, **delete** this block (the room winner is now set only by `recordGameResult` after both players agree):
```javascript
    // if the winner is decided find the room in the database and update
    if(winner!=null)
    {
      let listOfRooms = await chatrooms.find({name:data.roomID});
      listOfRooms[0].winner = winner;
      await listOfRooms[0].save();
    }
```

Below the `SEND_MOVE` handler, add:
```javascript
  //handle a client reporting the end of the game; stats are committed
  //server-side once both participants report the same winner
  socket.on('GAME_OVER', async function (data) {
    try {
      const result = await recordGameResult(data.roomID, data.winner, socket.user.uid);
      console.log('GAME_OVER', data.roomID, data.winner, '->', result.status);
    } catch (err) {
      console.error('GAME_OVER failed:', err);
    }
  });
```

- [ ] **Step 6: Replace client-side stat writes with GAME_OVER reports**

In `frontend/src/components/game/game.component.jsx`:

1. Change the firebase import (line 10, as left by Task 8) from:
```javascript
import { setWinLoss, auth } from '../../firebase.config'
```
to:
```javascript
import { auth } from '../../firebase.config'
```

2. In `componentDidMount`'s `RECEIVE_MOVE` handler, replace the whole winner-handling block:
```javascript
            //if the winner is determined, then update the win/loss for the user
            if(move.winner)
            {
                //update firestore for the wins and losses in the user profile
                if(move.winner=='T')
                {
                    if(this.props.playerPiece=='tiger')
                    {
                        setWinLoss(1,0,this.props.userInfo.uid);
                    }
                    else if(this.props.playerPiece == 'goat')
                    {
                        setWinLoss(0,1,this.props.userInfo.uid);
                    }
                }
                else if(move.winner=='G'){
                    if(this.props.playerPiece=='tiger')
                    {
                        setWinLoss(0,1,this.props.userInfo.uid);
                    }
                    else if(this.props.playerPiece == 'goat')
                    {
                        setWinLoss(1,0,this.props.userInfo.uid);
                    }
                }
            }
```
with:
```javascript
            //if the winner is determined, confirm it to the server, which
            //records win/loss once both players have reported
            if(move.winner)
            {
                this.state.socket.emit('GAME_OVER', {roomID: this.props.roomID, winner: move.winner});
            }
```

3. In `sendMoves()`, replace the winner-handling block at the top of the function:
```javascript
        //if the winner is determined, then update the win/loss for the user
        if(this.state.winner)
        {
            //update firestore for the wins and losses in the user profile
            if(this.state.winner=='T')
            {
                if(this.props.playerPiece=='tiger')
                {
                    setWinLoss(1,0,this.props.userInfo.uid);
                }
                else if(this.props.playerPiece == 'goat')
                {
                    setWinLoss(0,1,this.props.userInfo.uid);
                }
            }
            else if(this.state.winner=='G'){
                if(this.props.playerPiece=='tiger')
                {
                    setWinLoss(0,1,this.props.userInfo.uid);
                }
                else if(this.props.playerPiece == 'goat')
                {
                    setWinLoss(1,0,this.props.userInfo.uid);
                }
            }
        }
```
with:
```javascript
        //if the winner is determined, report it to the server, which
        //records win/loss once both players have reported
        if(this.state.winner)
        {
            this.state.socket.emit('GAME_OVER', {roomID: this.props.roomID, winner: this.state.winner});
        }
```

4. In `frontend/src/firebase.config.js`, delete the `setWinLoss` function **and** its JavaDoc comment block (lines ~146–190), and remove the now-unused imports: change line 2 back to:
```javascript
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
```
(`updateDoc` and `increment` were only used by `setWinLoss`.)

- [ ] **Step 7: Verify**

1. `cd server && npm test` — `10 passed`.
2. `cd frontend && npm run build` — clean.
3. End-to-end smoke test: two signed-in browsers, play a full game to completion (fastest: tigers capturing 5 goats). Confirm:
   - server log shows two `GAME_OVER ... -> awaiting-confirmation` / `-> recorded` lines,
   - both players' profile pages show updated wins/losses,
   - the room's Mongo doc has `winner` set,
   - re-emitting `GAME_OVER` (refresh + reconnect) logs `already-recorded` and stats don't change again.

- [ ] **Step 8: Commit**

```bash
git add server/services/gameResult.js server/tests/gameResult.test.js server/bin/www frontend/src/components/game/game.component.jsx frontend/src/firebase.config.js
git commit -m "feat: record game results server-side with dual-player confirmation"
```

---

### Task 10: Lock down Firestore security rules (MANUAL — Firebase console)

With stats written exclusively by the Admin SDK (which bypasses rules), clients only need to: create their own profile doc at signup (with zeroed stats) and read profiles. Everything else gets denied.

**Files:** none in the repo (rules live in the Firebase console; the project has no `firebase.json`/CLI setup, and adding one is out of scope).

- [ ] **Step 1: Apply the rules**

Firebase console → project `gameoftiger-1f3fa` → Firestore Database → Rules → replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      // any signed-in user may view profiles (profile page)
      allow read: if request.auth != null;
      // a user may create only their own doc, only with zeroed stats
      allow create: if request.auth != null
                    && request.auth.uid == uid
                    && request.resource.data.wins == 0
                    && request.resource.data.losses == 0;
      // stats are written only by the server via the Admin SDK
      allow update, delete: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Publish.

- [ ] **Step 2: Verify**

1. Sign up a fresh account in the app — profile doc is created, profile page loads (create + read paths work).
2. In the browser devtools console on the app, with a signed-in session, attempt a forged stat write:
   ```javascript
   const { doc, updateDoc } = await import('firebase/firestore');
   const { firestore, auth } = await import('/src/firebase.config.js');
   await updateDoc(doc(firestore, `users/${auth.currentUser.uid}`), { wins: 9000 });
   ```
   Expected: rejected with `FirebaseError: Missing or insufficient permissions` — this is the exact attack this plan exists to stop.
3. Finish a real game (or reuse Task 9's smoke test) — stats still update, because the server's Admin SDK bypasses rules.

- [ ] **Step 3: Record completion**

No repo change to commit; tick this task's checkboxes in the plan file and commit the plan-file update:
```bash
git add docs/superpowers/plans/2026-06-12-security-design-fixes.md
git commit -m "docs: mark Firestore rules task complete"
```

---

### Task 11: Update documentation

**Files:**
- Modify: `README.md` (Prerequisites section)
- Modify: `CLAUDE.md` (Environment + Socket Events + API endpoints sections)

- [ ] **Step 1: README prerequisites**

In `README.md`, replace the Prerequisites section body with:
```markdown
- Node.js 18+
- A `server/.env` file with:
  - `ATLAS_URI=<your MongoDB connection string>`
  - `FIREBASE_SERVICE_ACCOUNT=<single-line service account JSON>` (Firebase console → Project settings → Service accounts → Generate new private key)
```

- [ ] **Step 2: CLAUDE.md**

In `CLAUDE.md`:

1. In the **Socket Events** section, add:
```markdown
- `GAME_OVER` - Client reports game result; server records win/loss in Firestore after both players report the same winner
```
2. In the **API Endpoints** section, annotate the protected endpoints:
```markdown
- `POST /room/generate` - Create multiplayer room (requires `Authorization: Bearer <Firebase ID token>`)
- `POST /room/validateRoom` - Check room exists (public)
- `POST /room/joinRoom` - Join and get assigned piece (requires `Authorization: Bearer <Firebase ID token>`)
```
3. In the **Environment** section, add:
```markdown
- Backend also expects `FIREBASE_SERVICE_ACCOUNT` in `server/.env` (service account JSON, single line) for token verification and server-side stat writes
- Sockets require a Firebase ID token via the Socket.io `auth` payload
```

- [ ] **Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: document auth requirements and FIREBASE_SERVICE_ACCOUNT"
```

---

## Self-Review Notes

- **Spec coverage:** Redirect imports → Task 1; route ordering + ACME → Task 2; setWinLoss race → Task 3 (interim) + Task 9 (final, server-side `FieldValue.increment`); unauthenticated API → Tasks 6–8; client-trusted win/loss → Tasks 9–10. Docs → Task 11.
- **Known accepted gap:** a colluding pair (or one player controlling both accounts in a room) can still fabricate an agreed result; preventing that requires server-side move validation (replaying game rules server-side), explicitly out of scope and documented in the header.
- **Ordering constraint:** Tasks 5–9 depend on the manual service-account step (Task 5 Step 1). Tasks 1–4 are independent and can be done while waiting for it. Task 9 depends on schema fields added in Task 7 and socket auth from Task 8.
- **Single-player note:** `setWinLoss` was only ever called from the multiplayer game component, so removing it does not affect single-player/local modes (they never recorded stats).
