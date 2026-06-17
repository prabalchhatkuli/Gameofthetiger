# AI Opponent (Play vs Computer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side minimax AI opponent to Bagchal's single-player mode, with Easy/Medium/Hard difficulty, player-chosen side, and a separate server-recorded AI stat track.

**Architecture:** A React-free `frontend/src/ai/` layer (pure rules module, position evaluator, minimax search, orchestrator) reused by the game component. The component drives AI turns via `componentDidUpdate` and applies every move (human and AI) through one shared path built on `rules.applyMove`. AI results post to a new authenticated `POST /ai-game/result` endpoint that increments nested `aiStats.<difficulty>.<side>` counters via the Firebase Admin SDK.

**Tech Stack:** React 18 + Vite (frontend), Vitest (new frontend test runner), Express 4 + Jest + firebase-admin (backend), Firestore.

**Reference spec:** `docs/superpowers/specs/2026-06-16-ai-opponent-design.md`

**Branch:** `ai-opponent` (already created off the working app).

---

## Board & rules facts (read before starting)

- Board = `Array(25)` of piece instances (`Piece`/`Tigerpiece`/`Goatpiece`), each with `.player` ∈ `'T'` | `'G'` | `null`. Grid is 5×5, indices 0–24. Tigers start at corners 0, 4, 20, 24.
- Piece classes live in `frontend/src/components/piece/`: `piece.component.js` (default export `Piece`), `tigerpiece.component.js` (default export `Tigerpiece`), `goatpiece.component.js` (default export `Goatpiece`).
- `goatPieceInstance.isMovePossible(src, dest, board)` → true iff `dest` is an adjacent point and `board[dest]` is empty (goats only step to empties).
- `tigerPieceInstance.isMovePossible(src, dest, board)` → true for a step to an adjacent empty **or** a capture jump over a goat to an empty landing.
- `tigerPieceInstance.isTigerBlocked(src, board)` → true iff the tiger at `src` has no move at all (used for goat-win detection).
- Adjacency: even index (`src % 2 === 0`) connects 8 ways (offsets ±1, ±4, ±5, ±6); odd index connects 4 ways (±1, ±5).
- **Tiger capture classification:** a tiger move from `src` to `dest` is a capture iff `Math.abs(src - dest)` ∈ `{2, 8, 10, 12}`; the captured goat sits at the midpoint `(src + dest) / 2`. Otherwise it is a step.
- Turn flag `gisnext` (in the component): `true` = goat to move, `false` = tiger to move.
- Goat placement phase: while `goatsOnBoard < 20`, a goat turn places a new goat on any empty cell; once `goatsOnBoard === 20`, goats move existing goats.
- Win conditions: `goatsTaken >= 5` → tigers win (`'T'`); all four tigers blocked → goats win (`'G'`).

**Move object shapes used throughout this plan:**
```js
{ type: 'place',   to }                  // goat placement
{ type: 'move',    from, to }            // non-capturing step (goat or tiger)
{ type: 'capture', from, to, captured }  // tiger jump; captured = midpoint index
```

---

### Task 1: Add Vitest to the frontend

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/ai/smoke.test.js` (temporary; deleted in Task 3)

- [ ] **Step 1: Install Vitest**

Run: `cd frontend && npm install --save-dev vitest`

- [ ] **Step 2: Add the test script**

In `frontend/package.json`, add a `test` script to the `scripts` block so it reads (keep `dev`/`build`/`preview` as they are):
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
```

- [ ] **Step 3: Write a smoke test**

Create `frontend/src/ai/smoke.test.js`:
```js
import { test, expect } from 'vitest';

test('vitest runs', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 4: Run it**

Run: `cd frontend && npm test`
Expected: `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/ai/smoke.test.js
git commit -m "test: add vitest to frontend"
```

---

### Task 2: Strip debug console.logs from the piece classes

The minimax search calls `isMovePossible` / `isTigerBlocked` thousands of times. The piece classes currently `console.log` on every call, which floods the console and slows the search. Remove only the debug logs; change no logic.

**Files:**
- Modify: `frontend/src/components/piece/goatpiece.component.js`
- Modify: `frontend/src/components/piece/tigerpiece.component.js`

- [ ] **Step 1: Remove the log in goatpiece**

In `frontend/src/components/piece/goatpiece.component.js`, delete the line inside `isMovePossible`:
```js
        console.log(boundaries);
```

- [ ] **Step 2: Remove the logs in tigerpiece**

In `frontend/src/components/piece/tigerpiece.component.js`, delete these lines (they appear in `isTigerBlocked` and `isMovePossible`):
```js
        console.log(boundaries);
```
(both occurrences) and in `isMovePossible` also delete:
```js
        console.log("length of moves");
        console.log(eatMoves);
        console.log(moves);
```

- [ ] **Step 3: Verify the app still builds**

Run: `cd frontend && npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Verify no debug logs remain in the piece classes**

Run: `cd frontend && grep -rn "console.log" src/components/piece/`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/piece/goatpiece.component.js frontend/src/components/piece/tigerpiece.component.js
git commit -m "perf: remove debug console.logs from piece move logic"
```

---

### Task 3: `rules.js` — board cloning and `getLegalMoves` (TDD)

**Files:**
- Create: `frontend/src/ai/rules.js`
- Create: `frontend/src/ai/rules.test.js`
- Delete: `frontend/src/ai/smoke.test.js`

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/ai/rules.test.js`:
```js
import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { cloneBoard, getLegalMoves } from './rules';

// Helpers to build boards from a compact description.
function emptyBoard() {
  return Array.from({ length: 25 }, () => new Piece());
}
function withTigersAtCorners() {
  const b = emptyBoard();
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  return b;
}

test('cloneBoard produces an independent board with same players', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  const c = cloneBoard(b);
  expect(c).not.toBe(b);
  expect(c[0].player).toBe('T');
  expect(c[12].player).toBe('G');
  c[12] = new Piece();
  expect(b[12].player).toBe('G'); // original unchanged
});

test('goat placement phase: every empty cell is a place move', () => {
  const b = withTigersAtCorners();
  const moves = getLegalMoves(b, /*gisnext*/ true, /*goatsOnBoard*/ 0);
  // 25 cells minus the 4 tiger corners = 21 empty placement targets
  expect(moves.length).toBe(21);
  expect(moves.every(m => m.type === 'place')).toBe(true);
  expect(moves.some(m => m.to === 12)).toBe(true);
  expect(moves.some(m => m.to === 0)).toBe(false); // occupied corner
});

test('goat movement phase: goats step to adjacent empties only', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  const moves = getLegalMoves(b, /*gisnext*/ true, /*goatsOnBoard*/ 20);
  // all moves originate from the single goat at 12 and are type 'move'
  expect(moves.length > 0).toBe(true);
  expect(moves.every(m => m.type === 'move' && m.from === 12)).toBe(true);
  // 12 is even -> 8 neighbors (6,7,8,11,13,16,17,18), all empty here
  expect(moves.map(m => m.to).sort((a, b) => a - b)).toEqual([6, 7, 8, 11, 13, 16, 17, 18]);
});

test('tiger moves include a capture when a goat is jumpable', () => {
  const b = withTigersAtCorners();
  b[1] = new Goat(); // goat adjacent to tiger at 0; landing 2 is empty
  const moves = getLegalMoves(b, /*gisnext*/ false, /*goatsOnBoard*/ 20);
  const capture = moves.find(m => m.type === 'capture');
  expect(capture).toBeDefined();
  expect(capture.from).toBe(0);
  expect(capture.to).toBe(2);
  expect(capture.captured).toBe(1);
});
```

- [ ] **Step 2: Run tests, confirm they fail**

Run: `cd frontend && npm test`
Expected: FAIL — `Cannot find module './rules'` (or `getLegalMoves is not a function`).

- [ ] **Step 3: Implement `cloneBoard` and `getLegalMoves`**

Create `frontend/src/ai/rules.js`:
```js
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';

// Tiger captures occur for these index distances; the captured goat is the midpoint.
const CAPTURE_DISTANCES = new Set([2, 8, 10, 12]);

/**/
/*
cloneBoard(board)
        Returns a new 25-cell board of fresh piece instances mirroring `board`'s
        players, so callers can mutate the copy without touching the original.
*/
/**/
export function cloneBoard(board) {
  return board.map(cell => {
    if (cell.player === 'T') return new Tiger();
    if (cell.player === 'G') return new Goat();
    return new Piece();
  });
}

/**/
/*
getLegalMoves(board, gisnext, goatsOnBoard)
        Enumerates every legal move for the side to move. Goats in the placement
        phase place on any empty cell; otherwise pieces use their own
        isMovePossible. Tiger moves are classified as 'capture' (jump) or 'move'
        (step) by index distance.
*/
/**/
export function getLegalMoves(board, gisnext, goatsOnBoard) {
  const moves = [];

  if (gisnext && goatsOnBoard < 20) {
    for (let to = 0; to < 25; to++) {
      if (board[to].player === null) moves.push({ type: 'place', to });
    }
    return moves;
  }

  const side = gisnext ? 'G' : 'T';
  for (let from = 0; from < 25; from++) {
    if (board[from].player !== side) continue;
    for (let to = 0; to < 25; to++) {
      if (to === from) continue;
      if (!board[from].isMovePossible(from, to, board)) continue;
      if (side === 'T' && CAPTURE_DISTANCES.has(Math.abs(from - to))) {
        moves.push({ type: 'capture', from, to, captured: (from + to) / 2 });
      } else {
        moves.push({ type: 'move', from, to });
      }
    }
  }
  return moves;
}
```

- [ ] **Step 4: Run tests, confirm they pass; delete the smoke test**

Run: `cd frontend && npm test`
Expected: the 4 rules tests pass (smoke test may still pass too). Then delete it:
```bash
rm frontend/src/ai/smoke.test.js
```
Re-run `cd frontend && npm test` → only `rules.test.js`, all passing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ai/rules.js frontend/src/ai/rules.test.js
git rm -q frontend/src/ai/smoke.test.js
git commit -m "feat(ai): rules module - cloneBoard and getLegalMoves"
```

---

### Task 4: `rules.js` — `applyMove` (TDD)

**Files:**
- Modify: `frontend/src/ai/rules.js`
- Modify: `frontend/src/ai/rules.test.js`

- [ ] **Step 1: Add failing tests**

Append to `frontend/src/ai/rules.test.js` (add `applyMove` to the import at the top: `import { cloneBoard, getLegalMoves, applyMove } from './rules';`):
```js
test('applyMove place: adds a goat, increments goatsOnBoard, toggles turn', () => {
  const b = withTigersAtCorners();
  const next = applyMove(b, { type: 'place', to: 12 }, { gisnext: true, goatsOnBoard: 0, goatsTaken: 0 });
  expect(next.board[12].player).toBe('G');
  expect(next.goatsOnBoard).toBe(1);
  expect(next.goatsTaken).toBe(0);
  expect(next.gisnext).toBe(false);
  expect(b[12].player).toBe(null); // original not mutated
});

test('applyMove move: relocates the piece and clears the source', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  const next = applyMove(b, { type: 'move', from: 12, to: 13 }, { gisnext: true, goatsOnBoard: 20, goatsTaken: 0 });
  expect(next.board[12].player).toBe(null);
  expect(next.board[13].player).toBe('G');
  expect(next.gisnext).toBe(false);
});

test('applyMove capture: removes captured goat, increments goatsTaken', () => {
  const b = withTigersAtCorners();
  b[1] = new Goat();
  const next = applyMove(b, { type: 'capture', from: 0, to: 2, captured: 1 },
    { gisnext: false, goatsOnBoard: 20, goatsTaken: 0 });
  expect(next.board[0].player).toBe(null);
  expect(next.board[2].player).toBe('T');
  expect(next.board[1].player).toBe(null); // captured goat gone
  expect(next.goatsTaken).toBe(1);
  expect(next.gisnext).toBe(true);
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd frontend && npm test`
Expected: FAIL — `applyMove is not a function`.

- [ ] **Step 3: Implement `applyMove`**

Append to `frontend/src/ai/rules.js`:
```js
/**/
/*
applyMove(board, move, state)
        Returns the next { board, goatsOnBoard, goatsTaken, gisnext } after
        applying `move`. Never mutates the input board. `state` is the current
        { gisnext, goatsOnBoard, goatsTaken }.
*/
/**/
export function applyMove(board, move, state) {
  const next = cloneBoard(board);
  let { goatsOnBoard, goatsTaken } = state;

  if (move.type === 'place') {
    next[move.to] = new Goat();
    goatsOnBoard += 1;
  } else if (move.type === 'move') {
    next[move.to] = state.gisnext ? new Goat() : new Tiger();
    next[move.from] = new Piece();
  } else { // capture
    next[move.to] = new Tiger();
    next[move.from] = new Piece();
    next[move.captured] = new Piece();
    goatsTaken += 1;
  }

  return { board: next, goatsOnBoard, goatsTaken, gisnext: !state.gisnext };
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `cd frontend && npm test`
Expected: all rules tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ai/rules.js frontend/src/ai/rules.test.js
git commit -m "feat(ai): rules module - applyMove"
```

---

### Task 5: `rules.js` — `getWinner` (TDD)

**Files:**
- Modify: `frontend/src/ai/rules.js`
- Modify: `frontend/src/ai/rules.test.js`

- [ ] **Step 1: Add failing tests**

Add `getWinner` to the import line, then append to `frontend/src/ai/rules.test.js`:
```js
test('getWinner: tigers win at 5 captures', () => {
  const b = withTigersAtCorners();
  expect(getWinner(b, 5)).toBe('T');
  expect(getWinner(b, 4)).toBe(null);
});

test('getWinner: goats win when all tigers are blocked', () => {
  // Surround all four corner tigers with goats so no tiger can move or jump.
  const b = withTigersAtCorners();
  // Corner 0 neighbors: 1,5,6 ; corner 4: 3,8,9 ; corner 20: 15,16,21 ; corner 24: 18,19,23
  [1, 5, 6, 3, 8, 9, 15, 16, 21, 18, 19, 23].forEach(i => { b[i] = new Goat(); });
  // landing cells for jumps (2,10,12 / 2,12,14 / 10,12,22 / 12,14,22) must be blocked too;
  // fill the remaining interior so no jump lands on an empty cell.
  [2, 7, 10, 11, 12, 13, 14, 17, 22].forEach(i => { if (b[i].player === null) b[i] = new Goat(); });
  expect(getWinner(b, 0)).toBe('G');
});

test('getWinner: returns null when a tiger can still move', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  expect(getWinner(b, 0)).toBe(null);
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd frontend && npm test`
Expected: FAIL — `getWinner is not a function`.

- [ ] **Step 3: Implement `getWinner`**

Append to `frontend/src/ai/rules.js`:
```js
/**/
/*
getWinner(board, goatsTaken)
        Returns 'T' if tigers have captured 5 goats, 'G' if every tiger on the
        board is blocked, otherwise null.
*/
/**/
export function getWinner(board, goatsTaken) {
  if (goatsTaken >= 5) return 'T';
  let sawTiger = false;
  for (let i = 0; i < 25; i++) {
    if (board[i].player === 'T') {
      sawTiger = true;
      if (!board[i].isTigerBlocked(i, board)) return null; // a tiger can move
    }
  }
  return sawTiger ? 'G' : null;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `cd frontend && npm test`
Expected: all rules tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ai/rules.js frontend/src/ai/rules.test.js
git commit -m "feat(ai): rules module - getWinner"
```

---

### Task 6: `evaluate.js` — position heuristic (TDD)

**Files:**
- Create: `frontend/src/ai/evaluate.js`
- Create: `frontend/src/ai/evaluate.test.js`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/ai/evaluate.test.js`:
```js
import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { evaluate } from './evaluate';

function withTigersAtCorners() {
  const b = Array.from({ length: 25 }, () => new Piece());
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  return b;
}

test('captures raise the tiger-perspective score', () => {
  const b = withTigersAtCorners();
  const noCaptures = evaluate(b, { goatsTaken: 0, goatsOnBoard: 0 });
  const someCaptures = evaluate(b, { goatsTaken: 3, goatsOnBoard: 0 });
  expect(someCaptures).toBeGreaterThan(noCaptures);
});

test('more trapped tigers lowers the tiger-perspective score', () => {
  const open = withTigersAtCorners();
  const trapped = withTigersAtCorners();
  // box the tiger at corner 0 with goats on 1,5,6
  [1, 5, 6].forEach(i => { trapped[i] = new Goat(); });
  expect(evaluate(trapped, { goatsTaken: 0, goatsOnBoard: 3 }))
    .toBeLessThan(evaluate(open, { goatsTaken: 0, goatsOnBoard: 3 }));
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd frontend && npm test`
Expected: FAIL — `Cannot find module './evaluate'`.

- [ ] **Step 3: Implement `evaluate`**

Create `frontend/src/ai/evaluate.js`:
```js
import { getLegalMoves } from './rules';

// Heuristic weights (tuned during Task 12). Score is from the TIGER's
// perspective: higher is better for tigers, lower (negative) better for goats.
const W_CAPTURE = 100;     // each goat captured
const W_TRAPPED = 60;      // each tiger with no legal move
const W_TIGER_MOBILITY = 2; // per available tiger move (mobility = tiger freedom)
const W_THREAT = 8;        // per immediately available capture

/**/
/*
evaluate(board, state)
        Scores a position from the tiger's perspective. state must include
        goatsTaken and goatsOnBoard.
*/
/**/
export function evaluate(board, state) {
  let score = 0;

  score += W_CAPTURE * state.goatsTaken;

  let trapped = 0;
  for (let i = 0; i < 25; i++) {
    if (board[i].player === 'T' && board[i].isTigerBlocked(i, board)) trapped += 1;
  }
  score -= W_TRAPPED * trapped;

  // Tiger mobility and capture threats: enumerate tiger moves regardless of whose turn.
  const tigerMoves = getLegalMoves(board, /*gisnext*/ false, /*goatsOnBoard*/ 20);
  score += W_TIGER_MOBILITY * tigerMoves.length;
  score += W_THREAT * tigerMoves.filter(m => m.type === 'capture').length;

  return score;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `cd frontend && npm test`
Expected: all evaluate tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ai/evaluate.js frontend/src/ai/evaluate.test.js
git commit -m "feat(ai): position evaluation heuristic"
```

---

### Task 7: `minimax.js` — search (TDD)

**Files:**
- Create: `frontend/src/ai/minimax.js`
- Create: `frontend/src/ai/minimax.test.js`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/ai/minimax.test.js`:
```js
import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { search } from './minimax';

function board25() {
  return Array.from({ length: 25 }, () => new Piece());
}

test('tiger takes an available capture', () => {
  const b = board25();
  b[0] = new Tiger();
  b[1] = new Goat(); // jumpable: 0 -> 2 capturing 1
  // movement phase, tiger to move
  const { move } = search(b, { gisnext: false, goatsOnBoard: 20, goatsTaken: 0 }, 2);
  expect(move.type).toBe('capture');
  expect(move.captured).toBe(1);
});

test('search returns a legal move object for the side to move', () => {
  const b = board25();
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  // goat placement phase
  const { move } = search(b, { gisnext: true, goatsOnBoard: 0, goatsTaken: 0 }, 2);
  expect(move.type).toBe('place');
  expect(b[move.to].player).toBe(null); // target was empty
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd frontend && npm test`
Expected: FAIL — `Cannot find module './minimax'`.

- [ ] **Step 3: Implement minimax with alpha-beta**

Create `frontend/src/ai/minimax.js`:
```js
import { getLegalMoves, applyMove, getWinner } from './rules';
import { evaluate } from './evaluate';

const WIN_SCORE = 1e6;

// Order captures first to improve alpha-beta pruning.
function order(moves) {
  return moves.slice().sort((a, b) => (b.type === 'capture' ? 1 : 0) - (a.type === 'capture' ? 1 : 0));
}

/**/
/*
search(board, state, depth)
        Root minimax with alpha-beta. state = { gisnext, goatsOnBoard, goatsTaken }.
        Tigers maximize the tiger-perspective evaluation; goats minimize.
        Returns { score, move } where move is the best move for the side to move
        (or null at a terminal position).
*/
/**/
export function search(board, state, depth) {
  const winner = getWinner(board, state.goatsTaken);
  if (winner === 'T') return { score: WIN_SCORE, move: null };
  if (winner === 'G') return { score: -WIN_SCORE, move: null };
  if (depth === 0) return { score: evaluate(board, state), move: null };

  const moves = order(getLegalMoves(board, state.gisnext, state.goatsOnBoard));
  if (moves.length === 0) return { score: evaluate(board, state), move: null };

  const maximizing = !state.gisnext; // tiger to move => maximize
  let best = { score: maximizing ? -Infinity : Infinity, move: moves[0] };
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    const after = applyMove(board, move, state);
    const childState = { gisnext: after.gisnext, goatsOnBoard: after.goatsOnBoard, goatsTaken: after.goatsTaken };
    const { score } = search(after.board, childState, depth - 1);

    if (maximizing) {
      if (score > best.score) best = { score, move };
      alpha = Math.max(alpha, score);
    } else {
      if (score < best.score) best = { score, move };
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }

  return best;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `cd frontend && npm test`
Expected: all minimax tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ai/minimax.js frontend/src/ai/minimax.test.js
git commit -m "feat(ai): minimax search with alpha-beta pruning"
```

---

### Task 8: `index.js` — `getAIMove` and difficulty mapping (TDD)

**Files:**
- Create: `frontend/src/ai/index.js`
- Create: `frontend/src/ai/index.test.js`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/ai/index.test.js`:
```js
import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { getAIMove } from './index';

function board25() {
  return Array.from({ length: 25 }, () => new Piece());
}

test('getAIMove returns a capture for the tiger on every difficulty', () => {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const b = board25();
    b[0] = new Tiger();
    b[1] = new Goat();
    const move = getAIMove(b, 'tiger', { gisnext: false, goatsOnBoard: 20, goatsTaken: 0 }, difficulty);
    expect(move.type).toBe('capture');
  }
});

test('getAIMove returns a placement during the goat placement phase', () => {
  const b = board25();
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  const move = getAIMove(b, 'goat', { gisnext: true, goatsOnBoard: 0, goatsTaken: 0 }, 'medium');
  expect(move.type).toBe('place');
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd frontend && npm test`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 3: Implement `getAIMove`**

Create `frontend/src/ai/index.js`:
```js
import { search } from './minimax';
import { getLegalMoves } from './rules';

// Difficulty -> search depth. Placement phase is capped lower (high branching).
const DEPTH = { easy: 2, medium: 3, hard: 4 };
const PLACEMENT_DEPTH = { easy: 1, medium: 2, hard: 2 };

// On easy, sometimes ignore the search and play a random legal move.
const EASY_RANDOM_CHANCE = 0.35;

/**/
/*
getAIMove(board, side, state, difficulty)
        Chooses the AI's move. side is the AI's side ('tiger' | 'goat').
        state = { gisnext, goatsOnBoard, goatsTaken }. difficulty in
        'easy' | 'medium' | 'hard'. Returns a move object (see plan header).
*/
/**/
export function getAIMove(board, side, state, difficulty) {
  const legal = getLegalMoves(board, state.gisnext, state.goatsOnBoard);
  if (legal.length === 0) return null;

  if (difficulty === 'easy' && Math.random() < EASY_RANDOM_CHANCE) {
    return legal[Math.floor(Math.random() * legal.length)];
  }

  const inPlacement = state.gisnext && state.goatsOnBoard < 20;
  const depth = inPlacement ? PLACEMENT_DEPTH[difficulty] : DEPTH[difficulty];
  const { move } = search(board, state, depth);
  return move || legal[0];
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `cd frontend && npm test`
Expected: all AI tests pass (rules, evaluate, minimax, index).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ai/index.js frontend/src/ai/index.test.js
git commit -m "feat(ai): getAIMove orchestrator with difficulty mapping"
```

---

### Task 9: Single-player setup screen (side + difficulty)

`gamechoice.component.jsx` currently calls `ReactDOM.render(<Game choice="single" .../>, ...)` directly on the "single player" button. Replace that with a small in-component setup screen that collects side + difficulty, then renders `<Game choice="single" playerSide=... difficulty=... />`.

**Files:**
- Modify: `frontend/src/components/gamechoice.component.jsx`

- [ ] **Step 1: Read the current component**

Read `frontend/src/components/gamechoice.component.jsx` fully to see its current state shape, the `singlePlayer()` method, and its `render()`.

- [ ] **Step 2: Add setup state and a setup screen**

Make these changes in `frontend/src/components/gamechoice.component.jsx`:

1. In the constructor's `this.state`, add:
```js
            showSinglePlayerSetup: false,
            aiSide: 'goat',
            aiDifficulty: 'medium',
```
2. Replace the body of `singlePlayer()` (which currently does `ReactDOM.render(<Game choice="single" ...>, ...)`) with:
```js
    singlePlayer(){
        this.setState({ showSinglePlayerSetup: true });
    }
```
3. Add a method that starts the configured single-player game (place it next to `singlePlayer`):
```js
    startSinglePlayer(){
        ReactDOM.render(
            <Game
                choice="single"
                playerSide={this.state.aiSide === 'tiger' ? 'goat' : 'tiger'}
                aiSide={this.state.aiSide}
                difficulty={this.state.aiDifficulty}
                userInfo={this.props.userInfo}
            />,
            document.getElementById('gametype')
        );
    }
```
(`aiSide` is the side the AI plays; `playerSide` is the human's side — the opposite.)

4. In `render()`, when `this.state.showSinglePlayerSetup` is true, show the setup UI instead of (or in addition to) the buttons. Add this block inside the returned JSX where the single-player button lives:
```jsx
                {this.state.showSinglePlayerSetup &&
                    <div className="single-setup">
                        <h5>Play vs Computer</h5>
                        <label htmlFor="aiSideSelect">You play as: </label>
                        <select id="aiSideSelect" value={this.state.aiSide === 'tiger' ? 'goat' : 'tiger'}
                                onChange={e => this.setState({ aiSide: e.target.value === 'tiger' ? 'goat' : 'tiger' })}>
                            <option value="goat">Goat</option>
                            <option value="tiger">Tiger</option>
                        </select>
                        <label htmlFor="aiDiffSelect"> Difficulty: </label>
                        <select id="aiDiffSelect" value={this.state.aiDifficulty}
                                onChange={e => this.setState({ aiDifficulty: e.target.value })}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        <button onClick={() => this.startSinglePlayer()}>Start</button>
                    </div>
                }
```
5. Bind the new method in the constructor:
```js
        this.startSinglePlayer = this.startSinglePlayer.bind(this);
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Manual smoke (dev server)**

Run the app (`cd server && npm start` on 8000, and `cd frontend && npm run dev`), sign in, go to the game choice, click single player, and confirm the side/difficulty selectors appear and "Start" renders the board. (AI does not move yet — that is Task 10.)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/gamechoice.component.jsx
git commit -m "feat(ai): single-player setup screen for side and difficulty"
```

---

### Task 10: Drive AI turns in the game component

Wire the AI into `game.component.jsx`: on the AI's turn in single-player, compute and apply a move through a shared apply path. To keep one move-application path, add a helper `applyMoveToState(move)` built on `rules.applyMove`, used by the AI (and available for future human-path reuse).

**Files:**
- Modify: `frontend/src/components/game/game.component.jsx`

- [ ] **Step 1: Read the component's constructor and `handleClick`/`render`**

Read `frontend/src/components/game/game.component.jsx` lines 1–120 (constructor/state, `componentDidMount`) and 240–514 (`handleClick`, `render`) to confirm the state fields: `history` (array of `{ squares }`), `gisnext`, `goatsOnBoard`, `goatsTaken`, `winner`, `currentBoard`, `sourceSelection`, and `this.props.choice`.

- [ ] **Step 2: Import the AI and rules at the top of the file**

Add near the other imports:
```js
import { getAIMove } from '../../ai/index';
import { applyMove, getWinner } from '../../ai/rules';
```

- [ ] **Step 3: Add `applyMoveToState` and an AI-thinking flag**

In the constructor's `this.state`, add:
```js
            aiThinking: false,
```
Add this method to the class (near `sendMoves`):
```js
    /**/
    /*
    applyMoveToState(move)
            Applies a move object (place|move|capture) to the board via the pure
            rules engine and updates component state (history, board, counts,
            turn, winner). Shared move-application path for the AI.
    */
    /**/
    applyMoveToState(move){
        const current = this.state.history[this.state.history.length - 1];
        const result = applyMove(current.squares, move, {
            gisnext: this.state.gisnext,
            goatsOnBoard: this.state.goatsOnBoard,
            goatsTaken: this.state.goatsTaken
        });
        const winner = getWinner(result.board, result.goatsTaken);
        this.setState(state => ({
            history: state.history.concat([{ squares: result.board }]),
            currentBoard: result.board,
            goatsOnBoard: result.goatsOnBoard,
            goatsTaken: result.goatsTaken,
            gisnext: result.gisnext,
            winner: winner,
            status: winner ? (winner === 'T' ? 'Tiger Player is the winner' : 'Goat Player is the winner') : this.state.status
        }));
    }
```

- [ ] **Step 4: Add `componentDidUpdate` to drive AI turns**

Add this method to the class:
```js
    /**/
    /*
    componentDidUpdate()
            In single-player, when it becomes the AI's turn and the game is not
            over, compute and apply an AI move after a short delay.
    */
    /**/
    componentDidUpdate(){
        if (this.props.choice !== 'single') return;
        if (this.state.winner) return;
        if (this.state.aiThinking) return;

        const aiGisnext = this.props.aiSide === 'goat'; // true when it's goat's turn
        if (this.state.gisnext !== aiGisnext) return; // not the AI's turn

        this.setState({ aiThinking: true });
        setTimeout(() => {
            const current = this.state.history[this.state.history.length - 1];
            const move = getAIMove(current.squares, this.props.aiSide, {
                gisnext: this.state.gisnext,
                goatsOnBoard: this.state.goatsOnBoard,
                goatsTaken: this.state.goatsTaken
            }, this.props.difficulty);
            if (move) this.applyMoveToState(move);
            this.setState({ aiThinking: false });
        }, 400);
    }
```

- [ ] **Step 5: Guard human clicks during the AI's turn**

At the very top of `handleClick(i)` (after the existing `const squares = ...` setup but before the move logic), add a single-player guard so the human cannot move on the AI's turn:
```js
        if (this.props.choice === 'single') {
            const humanGisnext = this.props.playerSide === 'goat';
            if (this.state.gisnext !== humanGisnext || this.state.aiThinking) {
                this.setState({ status: 'Wait for the computer to move' });
                return;
            }
        }
```

- [ ] **Step 6: Verify build + AI unit tests still pass**

Run: `cd frontend && npm run build` → `✓ built`.
Run: `cd frontend && npm test` → all AI tests still pass (no regressions).

- [ ] **Step 7: Manual playtest**

With server (port 8000) and `npm run dev` running and signed in: start a single-player game as Goat vs Medium. Confirm the AI (tiger) makes a move ~0.4s after each of your moves, captures when it can, and that choosing Tiger makes the AI open with goat placements. Try Easy and Hard.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/game/game.component.jsx
git commit -m "feat(ai): drive single-player AI turns via shared apply path"
```

---

### Task 11: Backend `POST /ai-game/result` endpoint (TDD)

Record an AI game result into nested `aiStats.<difficulty>.<side>.<wins|losses>` on `users/{uid}` via the Admin SDK, behind `requireAuth`.

**Files:**
- Create: `server/routes/aiGame.js`
- Create: `server/tests/aiGame.test.js`
- Modify: `server/app.js`

- [ ] **Step 1: Write failing tests**

Create `server/tests/aiGame.test.js`:
```js
const mockDocUpdate = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn(() => ({ update: mockDocUpdate }));
const mockIncrement = jest.fn((n) => ({ __increment: n }));
jest.mock('../firebaseAdmin', () => {
  const firestore = () => ({ doc: mockDoc });
  firestore.FieldValue = { increment: mockIncrement };
  return { firestore, auth: () => ({ verifyIdToken: jest.fn() }) };
});

const { recordAiResult } = require('../routes/aiGame');

function makeRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

beforeEach(() => { mockDoc.mockClear(); mockDocUpdate.mockClear(); });

test('rejects invalid difficulty', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'insane', side: 'tiger', result: 'win' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(400);
  expect(mockDoc).not.toHaveBeenCalled();
});

test('rejects invalid side', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'hard', side: 'dragon', result: 'win' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(400);
});

test('rejects invalid result', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'hard', side: 'tiger', result: 'draw' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(400);
});

test('a win increments aiStats.<difficulty>.<side>.wins for the user', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'hard', side: 'tiger', result: 'win' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(200);
  expect(mockDoc).toHaveBeenCalledWith('users/u1');
  expect(mockDocUpdate).toHaveBeenCalledWith({ 'aiStats.hard.tiger.wins': { __increment: 1 } });
});

test('a loss increments the losses field', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'easy', side: 'goat', result: 'loss' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(mockDocUpdate).toHaveBeenCalledWith({ 'aiStats.easy.goat.losses': { __increment: 1 } });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `cd server && npm test`
Expected: FAIL — `Cannot find module '../routes/aiGame'`.

- [ ] **Step 3: Implement the route**

Create `server/routes/aiGame.js`:
```js
const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const requireAuth = require('../middleware/auth');

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SIDES = ['tiger', 'goat'];
const RESULTS = ['win', 'loss'];

/**/
/*
recordAiResult(req, res)
        Validates { difficulty, side, result } and atomically increments
        aiStats.<difficulty>.<side>.<wins|losses> on the requesting user's doc.
        req.user is set by requireAuth.
*/
/**/
async function recordAiResult(req, res) {
  const { difficulty, side, result } = req.body || {};
  if (!DIFFICULTIES.includes(difficulty) || !SIDES.includes(side) || !RESULTS.includes(result)) {
    return res.status(400).json({ error: 'Invalid difficulty, side, or result' });
  }
  const field = `aiStats.${difficulty}.${side}.${result === 'win' ? 'wins' : 'losses'}`;
  try {
    await admin.firestore().doc(`users/${req.user.uid}`)
      .update({ [field]: admin.firestore.FieldValue.increment(1) });
    res.status(200).json({ status: 'recorded' });
  } catch (err) {
    console.error('ai-game/result failed:', err);
    res.status(500).json({ error: 'Failed to record result' });
  }
}

router.post('/result', requireAuth, recordAiResult);

module.exports = router;
module.exports.recordAiResult = recordAiResult;
```

- [ ] **Step 4: Mount the route in `server/app.js`**

In `server/app.js`, near `var roomRouter = require('./routes/room');` add:
```js
var aiGameRouter = require('./routes/aiGame');
```
And near `app.use('/room', roomRouter);` add:
```js
app.use('/ai-game', aiGameRouter);
```

- [ ] **Step 5: Run, confirm pass**

Run: `cd server && npm test`
Expected: all tests pass (existing auth/gameResult tests + 5 new aiGame tests). Then check the app still parses: `node --check server/app.js && node --check server/routes/aiGame.js`.

- [ ] **Step 6: Commit**

```bash
git add server/routes/aiGame.js server/tests/aiGame.test.js server/app.js
git commit -m "feat(ai): POST /ai-game/result endpoint records aiStats via Admin SDK"
```

---

### Task 12: Report AI results from the client + profile display

When a single-player game ends with a winner, post the result; show the AI record on the profile page.

**Files:**
- Modify: `frontend/src/firebase.config.js` (add a small helper)
- Modify: `frontend/src/components/game/game.component.jsx` (call helper on game end)
- Modify: `frontend/src/components/profile.component.jsx` (display grid)

- [ ] **Step 1: Add a client helper to post the result**

In `frontend/src/firebase.config.js`, add (and ensure `auth` is already exported from this file — it is):
```js
import axios from 'axios';

/**/
/*
recordAiGame(difficulty, side, result)
        Posts a single-player AI game result to the backend, authenticated with
        the current user's Firebase ID token. side = the human's side
        ('tiger'|'goat'); result = 'win' | 'loss'. No-op if not signed in.
*/
/**/
export const recordAiGame = async (difficulty, side, result) => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    await axios.post('/ai-game/result', { difficulty, side, result },
        { headers: { Authorization: `Bearer ${token}` } });
};
```
(If `axios` is already imported in this file, do not add a duplicate import.)

- [ ] **Step 2: Call it once when a single-player game ends**

In `frontend/src/components/game/game.component.jsx`:

1. Add to the imports: `import { recordAiGame } from '../../firebase.config';`
2. Add an instance flag in the constructor's `this.state`: `aiResultRecorded: false,`
3. At the end of `applyMoveToState`'s `setState` (use the setState callback), trigger the post exactly once when a winner exists in single-player. Replace the `this.setState(state => ({ ... }))` call in `applyMoveToState` with a version that records on completion:
```js
        this.setState(state => ({
            history: state.history.concat([{ squares: result.board }]),
            currentBoard: result.board,
            goatsOnBoard: result.goatsOnBoard,
            goatsTaken: result.goatsTaken,
            gisnext: result.gisnext,
            winner: winner,
            status: winner ? (winner === 'T' ? 'Tiger Player is the winner' : 'Goat Player is the winner') : this.state.status
        }), () => {
            if (winner && this.props.choice === 'single' && !this.state.aiResultRecorded) {
                this.setState({ aiResultRecorded: true });
                const humanWon = (winner === 'T' && this.props.playerSide === 'tiger') ||
                                 (winner === 'G' && this.props.playerSide === 'goat');
                recordAiGame(this.props.difficulty, this.props.playerSide, humanWon ? 'win' : 'loss')
                    .catch(err => console.error('recordAiGame failed:', err));
            }
        });
```
(The human's win condition: tigers winning while the human is tigers, or goats winning while the human is goats.)

- [ ] **Step 3: Display the AI record on the profile page**

Read `frontend/src/components/profile.component.jsx` first to see how it loads the user document (it uses `getUserDocument`). The user doc now may include an `aiStats` map (absent for users who never played the AI). Add a section that renders a small grid; default missing cells to 0. Insert this JSX where the profile stats are shown:
```jsx
                <h5>Vs Computer</h5>
                <table>
                    <thead>
                        <tr><th>Difficulty</th><th>As Tiger (W–L)</th><th>As Goat (W–L)</th></tr>
                    </thead>
                    <tbody>
                        {['easy', 'medium', 'hard'].map(level => {
                            const s = (this.state.user && this.state.user.aiStats && this.state.user.aiStats[level]) || {};
                            const t = s.tiger || { wins: 0, losses: 0 };
                            const g = s.goat || { wins: 0, losses: 0 };
                            return (
                                <tr key={level}>
                                    <td>{level}</td>
                                    <td>{(t.wins || 0)}–{(t.losses || 0)}</td>
                                    <td>{(g.wins || 0)}–{(g.losses || 0)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
```
Adapt the field reference (`this.state.user...`) to however `profile.component.jsx` actually stores the loaded user document — read the component to match its existing state/prop shape before writing this.

- [ ] **Step 4: Verify build + tests**

Run: `cd frontend && npm run build` → `✓ built`.
Run: `cd frontend && npm test` → AI tests pass.
Run: `cd server && npm test` → all server tests pass.

- [ ] **Step 5: Manual end-to-end**

With server (8000), dev server, signed in, and `FIREBASE_SERVICE_ACCOUNT` configured: play a single-player game to completion (fastest: as tigers, capture 5 goats). Confirm the network tab shows `POST /ai-game/result` returning 200, and the profile page's "Vs Computer" grid reflects the result in the right difficulty/side cell.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/firebase.config.js frontend/src/components/game/game.component.jsx frontend/src/components/profile.component.jsx
git commit -m "feat(ai): record single-player results and show vs-computer stats"
```

---

### Task 13: Tuning pass and docs

**Files:**
- Modify: `frontend/src/ai/index.js` (depths) and `frontend/src/ai/evaluate.js` (weights) as needed
- Modify: `CLAUDE.md`

- [ ] **Step 1: Measure Hard move latency**

In the running app, play a Hard game and observe whether any AI move noticeably freezes the board. If a move takes more than ~500 ms, reduce `DEPTH.hard` in `frontend/src/ai/index.js` by 1, or cap placement depth, until moves feel responsive. (If even depth 4 is instant, optionally raise Hard to 5 and re-measure.) Record the final depths in a comment.

- [ ] **Step 2: Sanity-check difficulty feel**

Play one game each at Easy/Medium/Hard. Easy should be beatable and occasionally play obviously loose moves; Hard should punish blunders (take free captures, avoid walking tigers into traps). If Medium feels identical to Hard, widen the depth gap. If the tiger never blocks goats, bump `W_TRAPPED` / `W_TIGER_MOBILITY` in `frontend/src/ai/evaluate.js`.

- [ ] **Step 3: Update CLAUDE.md**

In `CLAUDE.md`, under the game-modes/overview area, note that single-player is now "vs computer (minimax AI, Easy/Medium/Hard, player picks side)"; and under API endpoints add:
```markdown
- `POST /ai-game/result` - Record a single-player AI game result (requires `Authorization: Bearer <Firebase ID token>`); increments separate `aiStats.<difficulty>.<side>` counters
```
Add a one-line pointer to `frontend/src/ai/` as the AI engine location in the directory structure section.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/ai/index.js frontend/src/ai/evaluate.js CLAUDE.md
git commit -m "chore(ai): tune difficulty depths/weights and document AI mode"
```

---

## Self-Review Notes

- **Spec coverage:** minimax engine → Tasks 3–8; client-side + difficulty (Easy/Medium/Hard) → Tasks 7–8; player picks side (AI both sides incl. placement) → Tasks 3/8/9/10; separate aiStats by difficulty×side → Tasks 11–12; new authenticated `POST /ai-game/result` via Admin SDK → Task 11; Vitest added → Task 1; profile display → Task 12; shared move-application path → Task 10 (`applyMoveToState` built on `rules.applyMove`); console.log strip prerequisite → Task 2; tuning + Web-Worker decision point → Task 13.
- **Accepted tradeoffs (from spec, not bugs):** local AI results are self-reported; the endpoint is authenticated and quarantined from ranked stats but not replay-validated. Web Worker is deferred unless Task 13 shows Hard stutters.
- **Type consistency:** move shapes (`place`/`move`/`capture` with `to`/`from`/`captured`) and `state` shape (`{ gisnext, goatsOnBoard, goatsTaken }`) are used identically across `rules`, `minimax`, `index`, and the component. `getAIMove(board, side, state, difficulty)` and `applyMove(board, move, state)` signatures match every call site.
- **Integration verification points:** Tasks 9, 10, 12 require reading the actual current `gamechoice.component.jsx`, `game.component.jsx`, and `profile.component.jsx` before editing, to match existing state/prop shapes (the plan gives the exact code to add and the fields it depends on).
```
