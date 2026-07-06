---
name: verify
description: >-
  Project verify recipe for gunslinger-ts — how to build, launch, and drive this
  engine end-to-end to observe a change actually working at runtime (not just
  passing tests). Invoked by the generic /verify skill, or directly when
  confirming an engine/CLI change behaves.
---

# Verifying gunslinger-ts at runtime

Verification here means **running the code and watching the change execute**, not running
Mocha. Tests are the author's evidence; `npm test` re-runs CI. See CLAUDE.md for architecture.

There are **two runtime surfaces**. Pick by what the change touches.

## Surface 1 — the engine (deterministic, no external deps) — default

The engine core (`src/engine/**`) is plain, deterministic TypeScript with **no LLM**. Drive it
through its real public entry point, `GameSession.playTurn(action, rawInput)`, with a throwaway
`tsx` script. This is the right surface for anything under `src/engine/` — actions, services,
entities, state, transactions.

- Put the script at repo root or in `src/` (so `./engine/...` imports and tsconfig resolve like
  `main.ts` does — a script under a scratch dir outside the repo will fail module resolution).
  **This overrides the general "put scratch files in a temp/job dir" convention** — the driver *must*
  live inside the repo tree or its relative imports won't resolve. Name it distinctively (e.g.
  `src/verifyXyz.ts`) and delete it when done.
- Build the `GameSession` with **all** entity factories it requires — `Factories` is
  `{ room, item, npc }` today, so import `DefaultRoomFactory` + `DefaultItemFactory` +
  `DefaultNpcFactory` (a missing one is a typecheck error, not a silent skip). Also import the actions
  you're driving + `createSampleWorldState` (`src/cli/sampleWorld.ts`). If a new entity type is added
  later, this factory set grows — mirror `main.ts`'s composition root, which is the source of truth.
- Assert against `session.getState()` between turns — it returns the **committed** state, so it
  proves transactions commit/roll back correctly across turns. For a **read-only** action, snapshot
  `JSON.stringify(getState())` before and after and assert equality to prove it mutated nothing.
- Run: `LOG_LEVEL=warn npx tsx src/<script>.ts`. **Delete the script afterward.**

**Reusable skeleton** (copy, swap the turn sequence, delete after):

```ts
import { GameSession } from './engine/session';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from './engine/entity';
import { createSampleWorldState } from './cli/sampleWorld';
// import the action classes you're driving, e.g.:
// import { LookAction } from './engine/action/look/LookAction';

const session = new GameSession(createSampleWorldState(), {
    room: new DefaultRoomFactory(),
    item: new DefaultItemFactory(),
    npc: new DefaultNpcFactory(),
});
const show = (label: string, v: unknown) => console.log(`\n### ${label}\n${JSON.stringify(v, null, 2)}`);

// show('look', session.playTurn(new LookAction(), undefined));
// console.log('room:', session.getState().player.currentRoomId);
```

A good sample-world scenario that exercises movement, pickup, inventory, the failure/rollback
seam, and unlocking (the sample world's puzzle: the `iron_key` in `tower` opens the locked
`chapel → south → wellyard` door):

```
look → move north → move west → pickUp coins → checkInventory
→ move north → pickUp iron_key → move east → move east → move south
→ move south   (blocked: exit_blocked, player stays in chapel — rollback)
→ unlock south (success, keyItemId iron_key)
→ move south   (now succeeds → wellyard)
→ checkInventory
```

Watch for: a **failed** turn must not mutate committed state (the blocked `move` leaves the
player where they were); `consumesKey: false` unlocks keep the key in inventory.

## Surface 2 — the full CLI app (LLM-driven)

`src/main.ts` is a readline loop wired to an **Ollama** LLM GameMaster (default model
`gpt-oss:20b`). Use this only when the change is in the CLI/`gamemaster` layer — the LLM makes it
non-deterministic and slow, so it's not the surface for engine logic.

- Launch: `LOG_LEVEL=warn npx tsx src/main.ts`, or `npm run build && npm start` (esbuild → `dist/index.js`).
- Env: `OLLAMA_HOST`, `OLLAMA_MODEL`, `LOG_LEVEL` (`info` default).
- **Needs a running Ollama** (`curl -s http://127.0.0.1:11434/api/tags`). If it's down, real turns
  are BLOCKED — but you can still confirm launch mechanics: `printf 'quit\n' | npx tsx src/main.ts`
  prints `Current room: entrance`, the `> ` prompt, then `Goodbye.` and exits 0 without touching
  the LLM (`quit`/`exit` short-circuit before any Ollama call).
- Drive real turns by piping input: `printf 'look around\ngo north\nquit\n' | npx tsx src/main.ts`.

## Gotchas

- macOS has no `timeout` (use `gtimeout`, or rely on `quit` exiting cleanly).
- `npm run build` is esbuild-only (no type emit); it externalizes `blessed` and `--loader:.md=text`.
- Don't confuse this with the pre-commit gate (`typecheck + test + lint`) — that's CI, not runtime
  verification.
