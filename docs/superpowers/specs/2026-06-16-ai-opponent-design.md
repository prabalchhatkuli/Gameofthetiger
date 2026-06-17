# AI Opponent (Play vs Computer) — Design

**Date:** 2026-06-16
**Status:** Approved (pending spec review)

## Goal

Give the existing single-player mode of Bagchal a real computer opponent. Today, picking "single player" renders `<Game choice="single">`, but the game logic only branches on `choice === 'multi'`, so single-player is effectively local hot-seat (one person moves both sides). This feature adds a heuristic (minimax) AI that plays one side automatically, with selectable difficulty, and records results in a separate stat track.

## Decisions (from brainstorming)

1. **AI type:** Heuristic minimax with alpha-beta pruning, running **client-side** in the browser. Instant, free, no API calls. (Not an LLM.)
2. **Sides:** The player picks their side (tiger or goat) before each single-player game; the AI plays the other side. The engine therefore handles **both** sides, including the goats' two phases (placement of 20 goats, then movement).
3. **Difficulty:** Three levels — Easy / Medium / Hard — mapped to search depth (plus randomness on Easy).
4. **Stats:** AI games are recorded **separately** from the human-vs-human ranked stats, bucketed by **difficulty × side played**.

## Non-Goals (out of scope)

- No server-side AI computation (minimax runs client-side).
- No LLM/Claude integration, no AI chat/commentary.
- No server-side validation/replay of the local AI game (results are self-reported, same accepted tradeoff as the multiplayer flow — quarantined into a separate stat track precisely because of this).
- No change to multiplayer or its ranked stats.
- No new difficulty knobs beyond Easy/Medium/Hard.

---

## Architecture

A new React-free `frontend/src/ai/` layer of small, pure, unit-testable modules. Purity matters here because minimax bugs are silent (the bot just plays badly), and it lets the engine be tested without React.

### `frontend/src/ai/rules.js` — single source of truth for game logic

Pure functions operating on the same board representation the component uses: an `Array(25)` of piece objects (`Piece`/`Tiger`/`Goat`), each exposing `.player` of `'T'` / `'G'` / `null`. Cells are the 5×5 grid indices 0–24; tigers start at corners 0, 4, 20, 24.

- `getLegalMoves(board, gisnext, goatsOnBoard)` → `Move[]`
  - Goat, placement phase (`goatsOnBoard < 20`): one `place` move per empty cell.
  - Goat, movement phase (`goatsOnBoard >= 20`): for each goat, each adjacent empty cell where `isMovePossible` is true.
  - Tiger: for each tiger, each adjacent empty cell (step) **and** each legal capture (jump over an adjacent goat to an empty landing cell).
- `applyMove(board, move, state)` → `{ board, goatsOnBoard, goatsTaken, gisnext }`
  - Returns a **new** cloned board (never mutates the input). Places/moves the piece; on a capture, removes the goat at the midpoint and increments `goatsTaken`; toggles `gisnext`; increments `goatsOnBoard` on a placement.
- `getWinner(board, goatsTaken)` → `'T'` | `'G'` | `null`
  - `'T'` if `goatsTaken >= 5`; `'G'` if every tiger is blocked (via the existing `isTigerBlocked`); otherwise `null`.

This module **reuses** the existing `isMovePossible` / `isTigerBlocked` on the piece classes and the capture math (source/dest distance ∈ {2, 8, 10, 12}, goat removed at `src - (src - dest) / 2`). The move-application and win-detection logic currently **inlined in `game.component.jsx`'s `handleClick`** is extracted into `rules.js` so the human and the AI apply moves through one identical path (a focused cleanup that also shrinks the 514-line component).

### `frontend/src/ai/evaluate.js` — position heuristic

`evaluate(board, state)` → number, scored from the tiger's perspective (positive favors tigers). Feature set (weights tuned during implementation):

- Goats captured (`goatsTaken`) — strongly positive for tigers.
- Tiger mobility — number of legal tiger moves (low mobility is bad for tigers, good for goats).
- Tigers trapped — count of tigers with no legal move.
- Capture threats — number of immediately available tiger captures.
- Goats remaining on board / safely connected.

The score is negated as needed so minimax can treat it from the side-to-move's perspective.

### `frontend/src/ai/minimax.js` — search

`minimax(board, state, depth, alpha, beta, maximizingForTiger)` → `{ score, move }`. Standard minimax with alpha-beta pruning. Move ordering (captures first) is applied at higher depths to improve pruning. Terminal nodes (a winner exists or depth 0) return `evaluate(...)`.

### `frontend/src/ai/index.js` — orchestration

`getAIMove(board, side, state, difficulty)` → `Move`. Maps difficulty to search behavior, runs the search, and returns the chosen move. `side` is the AI's side (`'tiger'` | `'goat'`); `state` is `{ gisnext, goatsOnBoard, goatsTaken }`.

### Move representation

```js
{ type: 'place',   to }                 // goat placement
{ type: 'move',    from, to }           // non-capturing step (goat or tiger)
{ type: 'capture', from, to, captured } // tiger jump; `captured` = midpoint index
```

---

## Difficulty mapping

| Level  | Behavior |
|--------|----------|
| Easy   | Shallow search (depth 1–2) with injected randomness — picks among the top few moves rather than always the best, and occasionally a random legal move, so it makes human-beatable mistakes. |
| Medium | Honest minimax at moderate depth, no randomness. |
| Hard   | Deepest search with capture-first move ordering. |

Exact depths are tuned during implementation. The goat **placement** phase has a high branching factor (every empty cell), so depth is capped lower during placement to keep moves fast.

### Performance

Search runs on the **main thread first**. Bagchal is small (25 cells, ≤4 tigers, modest branching), so searches should return well under a second. If Hard measurably stutters the UI, move the search into a **Web Worker** and show a "thinking…" indicator — added only if measurement shows it's needed, not preemptively.

---

## Game-flow integration

### Side & difficulty selection

The single-player entry (currently `GameChoice.singlePlayer()` → `<Game choice="single">`) gains a small pre-game selector: choose **side** (Tiger / Goat) and **difficulty** (Easy / Medium / Hard). These are passed to `<Game>` as props (`playerSide`, `difficulty`). (Note: `gamechoice.component.jsx` currently uses the deprecated `ReactDOM.render(...)` into DOM nodes — a pre-existing smell. The selector is added with normal React state/conditional rendering; the broader `ReactDOM.render` refactor is out of scope.)

### Driving AI turns

`game.component.jsx` gains a single-player branch (`choice === 'single'`):

- After any move that toggles the turn, if it is now the AI's side and the game is not over, the component computes `getAIMove(...)` after a short delay (for natural pacing) and applies it through the same `rules.applyMove` path the human move uses.
- The AI never moves when a winner exists or when it is not its side.
- If the **human chose goats**, the AI plays tigers from move one; if the human **chose tigers**, the AI (goats) opens with the placement phase.

There is one move-application path (`rules.applyMove`) shared by human clicks and AI moves — no duplicated capture/win logic.

---

## AI stats (separate track)

### Firestore data model

On `users/{uid}`, a new nested map kept entirely separate from the ranked `wins` / `losses`:

```
aiStats: {
  easy:   { tiger: { wins: 0, losses: 0 }, goat: { wins: 0, losses: 0 } },
  medium: { tiger: { wins: 0, losses: 0 }, goat: { wins: 0, losses: 0 } },
  hard:   { tiger: { wins: 0, losses: 0 }, goat: { wins: 0, losses: 0 } }
}
```

The `tiger`/`goat` key is the **side the human played**. A win/loss increments the single matching cell.

### Recording path

A new authenticated backend endpoint:

- **`POST /ai-game/result`** — requires `Authorization: Bearer <Firebase ID token>` (reuses the existing `requireAuth` middleware). Body: `{ difficulty, side, result }` where `difficulty ∈ {easy, medium, hard}`, `side ∈ {tiger, goat}` (human's side), `result ∈ {win, loss}`. The server validates the enums, then atomically increments the matching nested field via the Admin SDK, e.g. `update({ ['aiStats.hard.tiger.wins']: FieldValue.increment(1) })`. Invalid enums → 400.

This keeps the locked-down Firestore rule (clients cannot write user stat docs; only the server via Admin SDK can) intact — the same architecture as the multiplayer stat recording. The client calls this endpoint when a single-player game ends with a winner.

### Why server-side for a local game

A locally-played AI result is inherently self-reported — the server didn't witness it. Routing it through the authenticated endpoint (rather than a direct client Firestore write) keeps all stat writes server-only and consistent with the security model, and isolates these casual numbers from the ranked record. Server-side replay/validation of the local game is explicitly out of scope.

### Profile display

`profile.component.jsx` shows the AI record as its own small grid (rows: Easy/Medium/Hard; columns: as Tiger / as Goat; cells: W–L), separate from the ranked wins/losses already shown.

---

## Testing

### Frontend (new: Vitest)

Add **Vitest** to `frontend` (the frontend currently has no test runner). Unit-test the pure AI modules:

- `rules.getLegalMoves`: goat placement enumerates all empty cells; goat movement respects adjacency; tiger steps and captures enumerated correctly; no moves when a tiger is fully blocked.
- `rules.applyMove`: a capture removes the correct goat (midpoint) and increments `goatsTaken`; a placement increments `goatsOnBoard`; the input board is not mutated; `gisnext` toggles.
- `rules.getWinner`: `'T'` at 5 captures; `'G'` when all tigers blocked; `null` otherwise.
- `minimax`/`getAIMove`: takes an available capture as tiger; avoids moving a tiger into a position where it gets trapped / a goat into immediate capture; Hard selects a provably better move than Easy in a constructed position.

### Backend (existing: Jest)

- `POST /ai-game/result`: rejects missing/invalid token (401), rejects invalid `difficulty`/`side`/`result` enums (400), and on valid input increments exactly the matching `aiStats.<difficulty>.<side>.<wins|losses>` field via the mocked Admin SDK.

---

## Files (summary)

**New (frontend):** `src/ai/rules.js`, `src/ai/evaluate.js`, `src/ai/minimax.js`, `src/ai/index.js`, plus `src/ai/*.test.js`; `vitest` config + dev dependency.
**New (backend):** `server/routes/aiGame.js` (or an addition to existing routes) for `POST /ai-game/result`, plus its Jest test; route mounted in `server/app.js`.
**Modified (frontend):** `game.component.jsx` (single-player AI turn driving; use `rules.applyMove`), `gamechoice.component.jsx` (side/difficulty selector), `profile.component.jsx` (AI stats grid), `firebase.config.js` or a small client helper for calling `/ai-game/result`.
**Modified (backend):** `app.js` (mount route); the `users/{uid}` document gains the `aiStats` map (created lazily on first AI result; `getUserDocument` tolerates its absence).

## Implementation-time tuning notes

- Calibrate minimax depths per difficulty and per phase (placement depth capped) against actual move latency.
- Tune `evaluate` weights so Medium feels fair and Hard is clearly stronger.
- Decide the AI "thinking" delay (e.g. 300–600 ms) for natural pacing.
