# Bootstrap → Tailwind + shadcn/ui Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan. Phase 2 tasks are independent and SHOULD be fanned out with superpowers:dispatching-parallel-agents. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace Bootstrap / React-Bootstrap with Tailwind CSS v4 + shadcn/ui (JSX), adopting shadcn's default look, in a single migration that removes Bootstrap.

**Architecture:** A sequential foundation phase installs Tailwind v4 (via `@tailwindcss/vite`), the `@/` path alias, and shadcn primitives. Then each Bootstrap-using component is migrated independently (parallelizable). A final phase removes Bootstrap and verifies.

**Tech Stack:** React 18 + Vite 5, Tailwind CSS v4, shadcn/ui (Radix primitives, `cn` util), JSX.

**Spec:** `docs/superpowers/specs/2026-06-16-bootstrap-to-tailwind-shadcn-design.md`. **Branch:** `tailwind-shadcn-migration`.

---

## Parallelization Guide

- **Phase 1 (Tasks 1–2): sequential, do first.** Everything depends on it. One agent (or the controller) completes both before Phase 2 starts.
- **Phase 2 (Tasks 3–10): fully parallel.** Eight independent component files, no shared files, all depend only on Phase 1. Dispatch them concurrently to separate subagents. Each commits its own file.
- **Phase 3 (Tasks 11–12): sequential, do last.** Only after all Phase 2 tasks have merged. Removes Bootstrap and verifies the whole app.

During Phase 2 both Tailwind and Bootstrap CSS are loaded at once (Bootstrap is removed only in Phase 3), so the in-progress branch may look visually mixed — that is expected; the real visual check is the Phase 3 manual pass.

---

## shadcn usage reference (applies to Phase 2 tasks)

After Phase 1, these are available. Import patterns:

```jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
```

**Button** — `variant` is `default | secondary | destructive | outline | ghost | link`; replace `react-bootstrap` `variant="primary"` → default, `"secondary"` → `secondary`, `"outline-success"` → `outline`, `"outline-danger"` → `destructive`/`outline`.

**Dialog** (modal) controlled by an `open` boolean:
```jsx
<Dialog open={show} onOpenChange={setShow}>
  <DialogContent>
    <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
    {/* body */}
    <DialogFooter>{/* buttons */}</DialogFooter>
  </DialogContent>
</Dialog>
```
For a **non-dismissible** dialog (winner), pass an `onOpenChange` that ignores close and prevent the default close affordances:
```jsx
<Dialog open={true}>
  <DialogContent onInteractOutside={(e)=>e.preventDefault()} onEscapeKeyDown={(e)=>e.preventDefault()} className="[&>button]:hidden">
```

**Tabs**:
```jsx
<Tabs defaultValue="new">
  <TabsList>
    <TabsTrigger value="new">Create New Room</TabsTrigger>
    <TabsTrigger value="old">Join with link</TabsTrigger>
  </TabsList>
  <TabsContent value="new">{/* ... */}</TabsContent>
  <TabsContent value="old">{/* ... */}</TabsContent>
</Tabs>
```

**RadioGroup**:
```jsx
<RadioGroup value={value} onValueChange={setValue} className="flex gap-4">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="goat" id="GoatChoice" />
    <Label htmlFor="GoatChoice">Goat</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="tiger" id="TigerChoice" />
    <Label htmlFor="TigerChoice">Tiger</Label>
  </div>
</RadioGroup>
```

**Bootstrap utility class → Tailwind:** `container` → `mx-auto max-w-2xl px-4`; `text-center` → `text-center`; `text-light` → `text-white`; `bg-success` → `bg-green-600`; `text-success` → `text-green-600`; `text-warning` → `text-yellow-500`; `d-inline-block` → `inline-block`.

**Every Phase 2 task MUST:** read the current file first; preserve ALL existing imports that aren't Bootstrap, all state, all handlers, all logic (auth calls, axios, socket, routing) exactly; change only presentation. After the task, `grep -n "react-bootstrap" <file>` must be empty.

---

## Phase 1 — Foundation (sequential)

### Task 1: Install Tailwind v4, Vite plugin, and the `@/` alias

**Files:**
- Modify: `frontend/vite.config.js`
- Modify: `frontend/tsconfig.json`
- Create: `frontend/src/index.css`
- Modify: `frontend/src/index.jsx`

- [ ] **Step 1: Install Tailwind v4**

Run: `cd frontend && npm install tailwindcss @tailwindcss/vite`

- [ ] **Step 2: Add the Tailwind plugin and `@` alias to `vite.config.js`**

Read `frontend/vite.config.js`, then set it to:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    proxy: {
      '/room': 'http://localhost:8000',
      '/socket.io': { target: 'http://localhost:8000', ws: true },
    },
  },
});
```
(Preserve the existing port/proxy values — they were set to 8000 earlier.)

- [ ] **Step 3: Add `baseUrl` + `paths` to `tsconfig.json`**

In `frontend/tsconfig.json`, add to `compilerOptions` (keep all existing options):
```json
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
```

- [ ] **Step 4: Create the global stylesheet**

Create `frontend/src/index.css` with exactly:
```css
@import "tailwindcss";
```
(shadcn init in Task 2 appends its theme variables here.)

- [ ] **Step 5: Import the stylesheet in `index.jsx` (keep Bootstrap for now)**

In `frontend/src/index.jsx`, add `import './index.css';` immediately AFTER the existing `import 'bootstrap/dist/css/bootstrap.min.css';` line. (Bootstrap stays until Phase 3.)

- [ ] **Step 6: Verify Tailwind works**

Temporarily add `className="text-3xl font-bold underline"` to an element (e.g. the landing `<h2>`), run `cd frontend && npm run dev`, confirm the utility applies, then revert the temporary change. Run `cd frontend && npm run build` → `✓ built`.

- [ ] **Step 7: Commit**

```bash
git add frontend/vite.config.js frontend/tsconfig.json frontend/src/index.css frontend/src/index.jsx frontend/package.json frontend/package-lock.json
git commit -m "build: add Tailwind v4 + @/ alias (Bootstrap still present)"
```

---

### Task 2: shadcn init (JSX) + generate primitives

**Files:**
- Create: `frontend/components.json`, `frontend/src/lib/utils.js`, `frontend/src/components/ui/{button,dialog,tabs,input,label,radio-group}.jsx`
- Modify: `frontend/src/index.css` (shadcn appends theme vars)

- [ ] **Step 1: Initialize shadcn in JS mode**

Run: `cd frontend && npx shadcn@latest init`
Answer prompts: **JavaScript** (not TypeScript → produces `"tsx": false`); base color **Neutral**; global CSS file `src/index.css`; import alias components `@/components`, utils `@/lib/utils`. This creates `components.json`, `src/lib/utils.js` (the `cn` helper), writes CSS variables into `src/index.css`, and installs `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`.

- [ ] **Step 2: Generate the primitives**

Run: `cd frontend && npx shadcn@latest add button dialog tabs input label radio-group`
Confirm `src/components/ui/button.jsx`, `dialog.jsx`, `tabs.jsx`, `input.jsx`, `label.jsx`, `radio-group.jsx` exist (`.jsx`, not `.tsx`).

- [ ] **Step 3: Verify build + a primitive renders**

Run: `cd frontend && npm run build` → `✓ built`.
Confirm the alias resolves: `cd frontend && node -e "require('fs').accessSync('src/lib/utils.js')" && echo "utils ok"`.

- [ ] **Step 4: Verify AI tests unaffected**

Run: `cd frontend && npm test` → still 16 passed.

- [ ] **Step 5: Commit**

```bash
git add frontend/components.json frontend/src/lib frontend/src/components/ui frontend/src/index.css frontend/package.json frontend/package-lock.json
git commit -m "build: init shadcn/ui (jsx) and add base primitives"
```

---

## Phase 2 — Component migrations (PARALLEL: Tasks 3–10)

> Dispatch these concurrently. Each touches exactly one component file, depends only on Phase 1, and commits independently. Use the shadcn usage reference above.

### Task 3: Migrate `navbar.component.jsx`

**Files:** Modify: `frontend/src/components/navbar.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve: the `signOut(auth)` handler, the goat/tiger SVG imports and brand, the links (Play the Game→/game, Instruction→/instruction, About→/about, Profile→/Profile, Log In/Signup→/login), and the `props.userInfo === null` conditionals.

- [ ] **Step 2: Replace imports.** Remove `import Nav from 'react-bootstrap/Nav'`, `import Navbar from 'react-bootstrap/Navbar'`, `import Button from 'react-bootstrap/Button'`. Add `import { Button } from '@/components/ui/button';`. Keep `auth`, `signOut`, `goatSvg`, `tigerSvg` imports.

- [ ] **Step 3: Replace the markup** with a Tailwind flex nav (no Bootstrap collapse). Use:
```jsx
return (
  <nav className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2 shadow-sm">
    <a href="/" className="flex items-center gap-2 font-semibold">
      <img alt="" src={goatSvg} width="30" height="30" className="inline-block align-top" />
      Game of the Tiger
      <img alt="" src={tigerSvg} width="30" height="30" className="inline-block align-top" />
    </a>
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" asChild><a href="/game">Play the Game</a></Button>
      <a href="/instruction" className="px-2 text-sm hover:underline">Instruction</a>
      <a href="/about" className="px-2 text-sm hover:underline">About</a>
      {props.userInfo !== null && <a href="/Profile" className="px-2 text-sm hover:underline">Profile</a>}
      {props.userInfo === null
        ? <Button variant="outline" asChild><a href="/login">Log In/Sign Up</a></Button>
        : <Button variant="destructive" onClick={signout}>Signout</Button>}
    </div>
  </nav>
);
```
Keep the `signout()` function (calls `signOut(auth)`) exactly as is.

- [ ] **Step 4: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -n "react-bootstrap" frontend/src/components/navbar.component.jsx` → empty.

- [ ] **Step 5: Commit.** `git add frontend/src/components/navbar.component.jsx && git commit -m "feat(ui): migrate navbar to tailwind/shadcn"`

---

### Task 4: Migrate `landingpage.component.jsx`

**Files:** Modify: `frontend/src/components/landingpage.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve the `props.userInfo` conditional and the hero structure; note it imports `'../App.css'` (the `hero-image`/`hero-text` classes live there — keep that import and those class names).

- [ ] **Step 2: Replace imports.** Remove `import Image from 'react-bootstrap/Image'` (it is unused in the body — there is no `<Image>` in the current render). Keep `import '../App.css'`.

- [ ] **Step 3: Convert the Bootstrap utility classes.** Change the welcome banner:
```jsx
<div className="text-center text-white bg-green-600">
```
(was `text-center text-light bg-success`). Leave `hero-image`/`hero-text` (custom App.css) and the inline font-size style unchanged.

- [ ] **Step 4: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -n "react-bootstrap" frontend/src/components/landingpage.component.jsx` → empty.

- [ ] **Step 5: Commit.** `git add frontend/src/components/landingpage.component.jsx && git commit -m "feat(ui): migrate landing page to tailwind"`

---

### Task 5: Migrate `loginpage.component.jsx`

**Files:** Modify: `frontend/src/components/loginpage.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve all handlers (`handleLogin`, `handleEmailChange`, `handlePasswordChange`, `handleRemember`, `enterPressed`), the `signInWithEmailAndPassword(auth, ...)` call, and the `Link` to /signup.

- [ ] **Step 2: Replace imports.** Remove `import Button from 'react-bootstrap/Button'` and `import Form from 'react-bootstrap/Form'`. Add:
```jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
```
Keep the `Link`, firebase, and `auth` imports.

- [ ] **Step 3: Replace the `render()` return** with:
```jsx
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h3 className="mb-4 text-2xl font-semibold">Sign In</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="Enter email" onChange={this.handleEmailChange} />
            <p className="text-sm text-muted-foreground">***We'll never share your info with anyone else.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" onKeyPress={this.enterPressed.bind(this)} onChange={this.handlePasswordChange} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" onChange={this.handleRemember} /> Remember me
          </label>
          <div className="flex gap-2">
            <Button variant="default" onClick={this.handleLogin}>Submit</Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Don't have an Account? Create one</Link>
            </Button>
          </div>
        </div>
      </div>
    );
```

- [ ] **Step 4: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -n "react-bootstrap" frontend/src/components/loginpage.component.jsx` → empty.

- [ ] **Step 5: Commit.** `git add frontend/src/components/loginpage.component.jsx && git commit -m "feat(ui): migrate login form to tailwind/shadcn"`

---

### Task 6: Migrate `signup.component.jsx`

**Files:** Modify: `frontend/src/components/signup.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve all handlers (`handleSignup`, `handleEmailChange`, `handleFirstnameChange`, `handleLastnameChange`, `handlePasswordChange`, `handleConfirmPasswordChange`), the `createUserWithEmailAndPassword(auth, ...)` + `generateUserDocument(...)` calls, the password-match `alert`, and the `Link` to /login.

- [ ] **Step 2: Replace imports.** Remove `import Button from 'react-bootstrap/Button'` and `import Form from 'react-bootstrap/Form'`. Add the shadcn `Button`, `Input`, `Label` imports (as in Task 5). Keep firebase, `auth`, `generateUserDocument`, `Link`, `createUserWithEmailAndPassword` imports.

- [ ] **Step 3: Replace the `render()` return** with:
```jsx
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h3 className="mb-4 text-2xl font-semibold">Create an account with us</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="example@example.com" onChange={this.handleEmailChange} />
            <p className="text-sm text-muted-foreground">***We'll never share your info with anyone else.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="firstname">Firstname</Label>
            <Input id="firstname" type="text" placeholder="Lorem" onChange={this.handleFirstnameChange} />
            <Label htmlFor="lastname">Lastname</Label>
            <Input id="lastname" type="text" placeholder="Ipsum" onChange={this.handleLastnameChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Secret Password" onChange={this.handlePasswordChange} />
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" placeholder="Retype same Password" onChange={this.handleConfirmPasswordChange} />
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={this.handleSignup}>Create an account</Button>
            <Button variant="outline" asChild><Link to="/login">Back to Login?</Link></Button>
          </div>
        </div>
      </div>
    );
```

- [ ] **Step 4: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -n "react-bootstrap" frontend/src/components/signup.component.jsx` → empty.

- [ ] **Step 5: Commit.** `git add frontend/src/components/signup.component.jsx && git commit -m "feat(ui): migrate signup form to tailwind/shadcn"`

---

### Task 7: Migrate `chat/multichoice.component.jsx` (most complex)

**Files:** Modify: `frontend/src/components/chat/multichoice.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve: `onGenerateButtonClick` (axios POST `/room/generate` with the Bearer token), `createGame`, `joinGame`, `setPlayerPiece`, `onCloseButtonClick`, the `setRedirect`/`window.location.href` redirect logic, the `auth` import, and `axios`. It currently uses `ReactDOM.render` to inject the generate result into `<div id="generate result">` — this is replaced with React state (see Step 4).

- [ ] **Step 2: Replace imports.** Remove `import ReactDOM from 'react-dom'`, `import Modal from 'react-bootstrap/Modal'`, `import Button from 'react-bootstrap/Button'`, `import Tabs from 'react-bootstrap/Tabs'`, `import Tab from 'react-bootstrap/Tab'`. Add:
```jsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
```
Keep `auth`, `axios`, React imports.

- [ ] **Step 3: Add state for the generate result.** In the constructor's `this.state`, add `generateResult: null` and `joinLink: ''`. (`generateResult` replaces the `ReactDOM.render` injection.)

- [ ] **Step 4: Rework `onGenerateButtonClick`** to use state instead of `ReactDOM.render`. Replace the `ReactDOM.render(errorMsg, ...)` / `ReactDOM.render(successMsg, ...)` calls: on error `this.setState({ generateResult: { ok: false } })`; on success `this.setState({ generateResult: { ok: true, link: response.data.roomID } })`. Keep the axios call and the `linkId` state update.

- [ ] **Step 5: Rework `joinGame`** to read the URL from state: bind the join `<Input>`'s `onChange` to `this.setState({ joinLink: e.target.value })`, and in `joinGame` use `this.state.joinLink` instead of `document.getElementById("JoinGame").value`.

- [ ] **Step 6: Replace the `render()` return** (the `modalShow ? ... : redirect` flow stays; the redirect branch is unchanged). The modal branch becomes:
```jsx
      <Dialog open={this.state.modalShow} onOpenChange={(o)=>{ if(!o) this.onCloseButtonClick(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Multiplayer game</DialogTitle></DialogHeader>
          <h5 className="font-medium">Join:</h5>
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">Create New Room</TabsTrigger>
              <TabsTrigger value="old">Join with link</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="space-y-3">
              <h6 className="font-medium">Choose Your piece</h6>
              <RadioGroup value={this.state.playerPiece || ''} onValueChange={(v)=>this.setPlayerPiece({ target: { value: v } })} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="goat" id="GoatChoice" /><Label htmlFor="GoatChoice">Goat</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="tiger" id="TigerChoice" /><Label htmlFor="TigerChoice">Tiger</Label></div>
              </RadioGroup>
              <p>Share the link below with your friends</p>
              {this.state.generateResult && (this.state.generateResult.ok
                ? <p className="text-green-600">http://gameoftiger.prabal.dev/room/{this.state.generateResult.link}</p>
                : <p className="text-yellow-500">Error in generating key. Please press again.</p>)}
              <Button onClick={this.onGenerateButtonClick}>Generate game link</Button>
              <Button onClick={this.createGame}>Submit</Button>
            </TabsContent>
            <TabsContent value="old" className="space-y-3">
              <Label htmlFor="JoinGame">Paste the URL Below to join the Room:</Label>
              <Input type="url" id="JoinGame" value={this.state.joinLink} onChange={(e)=>this.setState({ joinLink: e.target.value })} />
              <Button onClick={this.joinGame}>Join Game</Button>
            </TabsContent>
          </Tabs>
          <DialogFooter><Button variant="secondary" onClick={this.onCloseButtonClick}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
```
Note: `setPlayerPiece` currently reads `event.target.value` — calling it as `this.setPlayerPiece({ target: { value: v } })` preserves its existing body. (If the existing `setPlayerPiece` has a known bug where it reads stale state, do not fix it here — keep behavior; the migration is presentation-only.)

- [ ] **Step 7: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -nE "react-bootstrap|react-dom" frontend/src/components/chat/multichoice.component.jsx` → empty (ReactDOM no longer used).

- [ ] **Step 8: Commit.** `git add frontend/src/components/chat/multichoice.component.jsx && git commit -m "feat(ui): migrate multiplayer modal to shadcn dialog/tabs/radio"`

---

### Task 8: Migrate `chat/gameroom.component.jsx`

**Files:** Modify: `frontend/src/components/chat/gameroom.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve all logic (`validateRoom`, `startGame`, the token-bearing axios calls, the `<Game>` render branch). The only Bootstrap usage is `Button`.

- [ ] **Step 2: Replace import.** Remove `import Button from 'react-bootstrap/Button'`. Add `import { Button } from '@/components/ui/button';`.

- [ ] **Step 3: The existing `<Button onClick={startGame}>Start Game</Button>` works unchanged** with the shadcn Button (same `onClick`/children API). No markup change needed beyond the import. Optionally wrap the surrounding `<h4>`s with Tailwind spacing, but not required.

- [ ] **Step 4: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -n "react-bootstrap" frontend/src/components/chat/gameroom.component.jsx` → empty.

- [ ] **Step 5: Commit.** `git add frontend/src/components/chat/gameroom.component.jsx && git commit -m "feat(ui): migrate gameroom button to shadcn"`

---

### Task 9: Migrate `game/winner.component.jsx`

**Files:** Modify: `frontend/src/components/game/winner.component.jsx`

- [ ] **Step 1: Read the current file.** Preserve the `props.winner` text logic and the "Understood" button's `window.location.href="/game"` redirect. The current modal is non-dismissible (`backdrop="static" keyboard={false}`, no working close).

- [ ] **Step 2: Replace imports.** Remove `import Modal from 'react-bootstrap/Modal'`, `import Button from 'react-bootstrap/Button'`, `import Tabs from 'react-bootstrap/Tabs'`, `import Tab from 'react-bootstrap/Tab'` (Tabs/Tab are unused here). Add:
```jsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
```
Keep `useState`, `UserContext` imports if present (UserContext may be unused — leave existing non-bootstrap imports as they are).

- [ ] **Step 3: Replace the modal markup** with a non-dismissible Dialog:
```jsx
    return (
      <Dialog open={show}>
        <DialogContent onInteractOutside={(e)=>e.preventDefault()} onEscapeKeyDown={(e)=>e.preventDefault()} className="[&>button]:hidden">
          <DialogHeader><DialogTitle>Game Over!!</DialogTitle></DialogHeader>
          <p>{props.winner=='T' ? 'Tiger' : 'Goat'} player is the winner of the game. Press understood to continue.</p>
          <DialogFooter>
            <Button variant="default" onClick={()=>{ window.location.href="/game"; }}>Understood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
```
Keep the `const [show, setShow] = useState(true);` line.

- [ ] **Step 4: Verify.** `cd frontend && npm run build` → `✓ built`. `grep -n "react-bootstrap" frontend/src/components/game/winner.component.jsx` → empty.

- [ ] **Step 5: Commit.** `git add frontend/src/components/game/winner.component.jsx && git commit -m "feat(ui): migrate winner modal to shadcn dialog"`

---

### Task 10: Tailwind-style the profile vs-computer table

**Files:** Modify: `frontend/src/components/profile.component.jsx`

- [ ] **Step 1: Read the current file.** It has no react-bootstrap import (it was added during the AI feature); it just needs Tailwind classes on the table and headings for visual consistency. Preserve all state and `getUserDocument` logic.

- [ ] **Step 2: Add Tailwind classes.** Wrap the outer container `<div className="container">` → `<div className="mx-auto max-w-2xl px-4 py-6">`. On the `<table>` add `className="w-full border-collapse text-left"`, on `<th>`/`<td>` add `className="border px-3 py-1"`. Keep the `aiStats` mapping logic untouched.

- [ ] **Step 3: Verify.** `cd frontend && npm run build` → `✓ built`.

- [ ] **Step 4: Commit.** `git add frontend/src/components/profile.component.jsx && git commit -m "feat(ui): tailwind-style profile vs-computer table"`

---

## Phase 3 — Remove Bootstrap and verify (sequential, after all of Phase 2)

### Task 11: Remove Bootstrap entirely + audit stragglers

**Files:** Modify: `frontend/src/index.jsx`, `frontend/package.json`, plus any straggler components found.

- [ ] **Step 1: Remove the Bootstrap CSS import.** In `frontend/src/index.jsx`, delete `import 'bootstrap/dist/css/bootstrap.min.css';` (keep `import './index.css';`).

- [ ] **Step 2: Remove the dependencies.** Run: `cd frontend && npm uninstall bootstrap react-bootstrap @popperjs/core`

- [ ] **Step 3: Audit for any remaining Bootstrap usage.**

Run: `cd frontend && grep -rnE "react-bootstrap|bootstrap/dist" src` → MUST be empty.
Run: `cd frontend && grep -rnE "\\bclassName=\"[^\"]*(btn|container|form-control|custom-control|text-(success|warning|light|muted)|d-inline-block)" src --include="*.jsx"`
For any hit (likely in `about.component.jsx`, `instruction.component.jsx`, `chat/chat.component.jsx`, or `gamechoice.component.jsx`), convert the Bootstrap utility classes to Tailwind equivalents (see the mapping in the reference section). Re-run until the grep is empty (the only allowed remaining `text-` hits are Tailwind colors like `text-green-600`, `text-white`, `text-yellow-500`, `text-muted-foreground`, `text-sm`, `text-center`, `text-2xl` — not the Bootstrap `text-success/warning/light/muted`).

- [ ] **Step 4: Verify build + tests.**

Run: `cd frontend && npm run build` → `✓ built`, no unresolved imports.
Run: `cd frontend && npm test` → AI suite still 16 passed.

- [ ] **Step 5: Commit.**
```bash
git add frontend/src/index.jsx frontend/package.json frontend/package-lock.json frontend/src
git commit -m "build: remove Bootstrap; convert remaining utility classes to Tailwind"
```

---

### Task 12: Manual visual verification

**Files:** none (manual). Requires the backend (port 8000) + `npm run dev` + a signed-in user + `FIREBASE_SERVICE_ACCOUNT` configured.

- [ ] **Step 1: Walk every screen and confirm render + interaction:**
  - Landing (signed out shows visitor message; signed in shows email; green welcome banner)
  - Navbar (links navigate; Log In shows when signed out, Signout when signed in; wraps on narrow width)
  - Login form (type email/password, submit logs in; "create account" link works)
  - Signup form (mismatched passwords alert; valid signup creates account and redirects)
  - Game choice (Play vs Computer / Two Players / Multiplayer buttons; AI side/difficulty selectors render)
  - Multiplayer modal (opens; tabs switch between Create/Join; goat/tiger radios select; Generate shows the link in green, error in yellow; Join navigates)
  - Winner modal (appears at game end; cannot be dismissed by clicking outside/Esc; Understood redirects to /game)
  - Profile (player info + vs-computer grid render with borders)

- [ ] **Step 2: Record the result** in the PR description (screens checked, anything off). Fix any regressions found, committing as needed.

---

## Self-Review Notes

- **Spec coverage:** Tailwind v4 + Vite plugin + alias → Task 1; shadcn init JSX + primitives → Task 2; the 7 components → Tasks 3–9; profile table → Task 10; remove Bootstrap deps/CSS + audit stragglers → Task 11; `game.css`/board untouched (never referenced in any task); verification → Tasks 11–12; `ReactDOM.render`→state cleanup in multichoice → Task 7.
- **Parallel safety:** Tasks 3–10 each modify exactly one distinct file (`navbar`, `landingpage`, `loginpage`, `signup`, `chat/multichoice`, `chat/gameroom`, `game/winner`, `profile`) — no overlap, safe to run concurrently. They all depend on Phase 1 only.
- **Consistency:** all component tasks import from `@/components/ui/*` (created in Task 2); Button `variant` values used (`default`/`outline`/`secondary`/`destructive`) are all valid shadcn variants.
- **Known accepted item:** during Phase 2 the branch loads both Tailwind and Bootstrap CSS — transient and expected; resolved in Task 11.
- **Note:** Task 7 preserves `setPlayerPiece`'s existing behavior even though it reads `event.target.value` via a synthetic `{target:{value}}` — presentation-only migration, no logic fixes.
```
