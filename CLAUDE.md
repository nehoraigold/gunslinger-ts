# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A text-based adventure game engine written in TypeScript. The core game state and logic (`src/`) is deterministic, plain TypeScript — genre-agnostic (despite "Gunslinger"/Dark Tower references elsewhere in the repo, the engine itself must not assume any specific story, world, or content). An LLM handles user input parsing and narration, and invokes tools to trigger state changes; the LLM-facing wiring is under active development in `src/gamemaster/` (see "GameMaster / LLM integration layer" below).

Long-term direction: this is being built primarily as a TypeScript **library/SDK** for building text adventures, with a standalone game as a sample consumer of that library. Keep engine code decoupled from any specific game's content and from any specific UI (terminal now, possibly web later) or persistence mechanism (in-memory now, files/DB later).

## Non-negotiable priorities

- **TDD and Clean Code are mandatory, not aspirational.** Write the test first or alongside the implementation — never leave a change untested. This project was previously rewritten from scratch (see `src_old/`) specifically because code quality deteriorated; do not repeat that.
- Apply DRY and SOLID. Keep classes and functions small, targeted, and well-named.
- Maintain clear boundaries: UI ↔ persistence ↔ engine. Wrap external dependencies (LLM SDKs, storage) behind abstractions rather than calling them directly from engine code.

## Design philosophy

- **Model the domain, not the implementation.** Ask "what concept does this represent?" before "where should this code go?" Code should read like a description of the game world, not a sequence of implementation steps.
- **Encapsulate behavior.** Objects should expose meaningful operations, not act as mutable data bags with setters. Prefer asking an object to do something over reaching in and changing its state; let it enforce its own invariants.
- **One responsibility per component**, and prefer composing small pieces over building inheritance hierarchies (unless the hierarchy genuinely models the domain).
- **Explicit dependencies.** No hidden globals, no module quietly constructing its own collaborators. A reader should see what a component depends on from its constructor/interface alone. Favor dependency injection.
- **Determinism: the engine is the sole authority on game state.** LLMs (and any other non-deterministic system) are external input, never part of game logic — same state + same action must always produce the same result. Design for an LLM that can misunderstand, hallucinate, or emit malformed output; the engine must stay correct regardless.
- **Validate at the boundary, trust inside it.** Once data enters the domain it should be a trusted domain type — don't re-validate the same thing repeatedly deeper in the call stack.
- **Make illegal states hard to represent.** Push constraints into the type system and domain model rather than scattering runtime checks.
- **No premature abstraction.** Solve today's problem cleanly, let duplication reveal the real pattern, then abstract. Once a pattern has proven itself, however, apply it consistently — don't re-litigate the same design decision per-case.

## Legacy / stale references — do not treat as ground truth

- `src_old/` — the previous, messier implementation. May contain useful ideas but do not imitate its structure or reuse it as a base.
- `.agent/CLAUDE.md`, `.agent/MEMORY.md`, `.agent/CLEAN_CODE_README.md` — describe an older, since-abandoned architecture (flat `engine/actions|npc|item`, `PLAN.md` 14-day roadmap). Ignore their architecture sections.
- `INSTRUCTIONS.md` — its described *architecture* is stale, but its LLM narration/tool-calling conventions (Dungeon Master system prompt, tool-call and narration rules) still reflect the intended design for the eventual LLM integration layer.

## Commands

```bash
npm run typecheck   # tsc --noEmit
npm test            # mocha (NOT vitest/jest, despite older docs mentioning them)
npm run lint         # eslint
npm run lint:fix    # eslint --fix
npm run build        # esbuild bundle to dist/
```

A git pre-commit hook (husky) runs lint-staged, typecheck, and the test suite — commits are blocked if any fail.

## Verifying changes

The husky gate (typecheck + test + lint) proves CI passes, not that a change *works at runtime*. For any non-trivial engine or CLI change, also:

- Run **`/verify`** to observe the change actually executing. The project verify skill (`.claude/skills/verify/SKILL.md`) has this repo's two drive recipes: the deterministic engine surface via `GameSession.playTurn` (default; no LLM), and the full Ollama-backed CLI (`src/main.ts`). This is the durable home for the manual end-to-end smoke test that the `new-action` skill's step 5 describes — prefer it over hand-rolling a throwaway driver from scratch.
- Run **`/code-review`** on the diff before committing — the "quality deteriorated last time" concern in *Non-negotiable priorities* is exactly what it guards.

## Testing conventions

- Test framework: Mocha + Chai (`expect`) + Sinon. Config in `.mocharc.json`; specs are `src/**/*.test.ts`.
- Tests are **colocated** with source (e.g. `src/engine/service/movement/MovementService.test.ts` next to `MovementService.ts`).
- Structure: `describe(ClassName.name, () => ...)`, nested `describe` per method, `it('should ...')`.
- Build state/fixtures with small local factory functions rather than large shared fixtures. Shared low-level helpers (e.g. `GameState.test.utils.ts`) are fine when genuinely reused across a module.

## Code style

- 4-space indentation, single quotes, trailing commas everywhere, 120-char print width (Prettier; violations are surfaced as ESLint errors, not just formatting warnings).
- `no-console` is a lint warning — don't leave stray `console.log`s.
- **Avoid comments whenever possible.** Prefer self-explanatory names and small, well-factored code over explanatory comments. Reserve comments for genuinely non-obvious *why* (a subtle invariant, a workaround, a deliberate deviation) — never restate *what* the code already says.
- ESLint uses flat config (`eslint.config.js`) with typed linting against `tsconfig.eslint.json`; `src_old/**` is excluded from linting.
- Prefer a descriptive adjective over a generic `Default` prefix for an implementation class name when a more specific one exists (`ActionToolCatalog`, `UnboundedConversationManager`) — reserve `Default` for when no more descriptive name is available.

## Engine architecture patterns

- **Entity vs. state split**: `src/engine/entity/` holds behavior (classes/factories), `src/engine/state/` holds plain data types. Don't mix the two.
- **Adding a new entity type threads through every layer in lockstep.** `Item`, `Room`, and `Npc` are the worked examples: introducing a new *kind of thing* in the world means adding, in parallel, a plain state type + id (`state/<x>/`), a store pair (`XStore` value store + `XsStore` keyed store), an entity interface + `DefaultX` + `XFactory`/`DefaultXFactory` (`entity/<x>/`), a `Context` accessor pair (`x()`/`requireX()`) + a `Factories` entry + an `XNotFoundError`, and a `Transaction`/`GameTransaction` store wired into `commit()`. Rooms reference contained entities by id (`RoomState.inventory` for items, `RoomState.npcIds` for NPCs), and the entity is surfaced to the player via `look` and the LLM `WorldSnapshotBuilder`. Because the new state type and its room-reference field are **required**, they break every `GameState`/`RoomState` literal (fixtures, `sampleWorld.ts`, test factories) — land the state change first and run `npm run typecheck` to enumerate that blast radius exactly. Follow the existing `Item`/`Room` files as the template rather than inventing a new shape.
- **Actions** (`src/engine/action/`): the shape (`defineAction`, `{ fail, succeed }` helpers, Zod-typed success/fail discriminated union) was carried over from `src_old/` as a starting point, not a settled design — treat it as provisional and expect it to change rather than assuming it's final.
- **Input validation** (`Action.schema: Schema<T>`, `src/utils/schema/`): one object owns both `parse()` and `toJsonSchema()`, so nothing downstream (e.g. the LLM tool catalog) needs to depend on Zod directly.
- **Immutability is handled by the store layer, not by call sites.** `store/` (keyed/value stores wrapping entity registries) clones on read and write internally, so callers do not need Immer or manual cloning to avoid mutating shared state — don't reach for `produce()` or similar here.
- **Session lifecycle** (`src/engine/session/`): `GameSession` is long-lived and holds the committed state; `GameSession.playTurn(action, rawInput)` is the sole public entry point. It parses input *before* opening a transaction (so malformed input never touches `StateManager`), runs exactly one action against a request-scoped `GameContext`, and — only if the action succeeds — advances the turn counter and applies the registered `OnTurnEffect`s (the post-turn hook) within that same transaction, then commits; a failed action, a thrown action, or a throwing effect rolls the whole turn back via `StateManager` (`src/engine/transaction/`), which owns the "one transaction open at a time" invariant. The "one action per transaction" guarantee is **structural** — `playTurn` opens a single transaction and runs a single `action.execute` per call. (An earlier single-use `ActionExecution` wrapper, formerly `GameTurn`, was removed once the tick refactor left it guarding nothing the structure didn't already enforce; the name-collision lesson it carried lives on in `playTurn`/`OnTurnEffect`.) Lifting the one-action-per-turn rule later for multi-action LLM turns changes only `playTurn`'s internals, not `StateManager`'s public shape.
- **Time / tick seam** (`src/engine/entity/tick/`, `state/tick/`, `session/OnTurnEffect.ts`): the engine has no clock — the passage of game time is a monotonic **turn counter** in committed state (`TurnCounterState.count`), advanced once per *successful* `playTurn` (by the private `GameSession.advanceTurn`). `TickSource` (`currentTick()`) is the narrow **read** seam future time-dependent systems depend on; `TurnCounter extends TickSource` adds `advance()`; `DefaultTurnCounter` is state-backed (so it survives save/load and stays deterministic). `OnTurnEffect.apply(context)` is the injected post-turn hook — turn-scoped systems (status effects, hunger, day/night) implement it and run after each successful action; none ship yet. Vocabulary is deliberate and three-layered: **"tick"** is the *generic, mechanism-agnostic* read unit (`TickSource`/`currentTick()`) — it is the only thing named "tick," and it never names a concrete mechanism or trigger; **"turn"** is the engine's *concrete per-action mechanism* (`playTurn`, `TurnCounter`, `advanceTurn`, `OnTurnEffect`) — one turn per player action; **"clock"/time-of-day** is reserved for a *possible future second mechanism* that advances in-world time by variable amounts at story moments (a quest milestone jumping 9 AM → 9 PM), not per action. The two mechanisms are designed to **coexist**: a `GameClock` would be a *second* `TickSource` with its own `advance` trigger and its own post-advance hook (e.g. `OnClockAdvance`), so turn-driven and time-driven effects stay distinct. This is why the per-turn hook is `OnTurnEffect`, **not** a generic `OnTickEffect` — a generic "tick" hook would blur the two mechanisms it's meant to keep separate. Don't name the turn counter `clock`, and don't name a turn-specific thing `tick`.
- Other layers: `context/` (request-scoped game context, composes stores), `transaction/` (state commit/rollback — see Session lifecycle above), `service/` (e.g. `MovementService` — orchestration logic above the entity/action layers).
- **Persistence** (`src/persistence/`): `SessionRepository` / `InMemorySessionRepository` is the seam the "in-memory now, files/DB later" intent above resolves to. Nothing in `engine/` or `gamemaster/` depends on it yet — it's there for whatever ends up owning session lifecycle.
- **Where does new functionality belong — service vs. action vs. existing method?** Ask whether the change introduces a *new invariant/rule set* governing a state transition, or is just a new trigger for a rule set that already exists:
  - A **new service** is warranted when the invariants differ from any existing service, even if the resulting mutation looks the same at the entity level (e.g. `TeleportationService` — arbitrary destination, its own preconditions — is not a method on `MovementService`, even though both end by calling `player.moveTo(room)`; `MovementService`'s cohesive responsibility is specifically exit-adjacency traversal).
  - A **new action** is warranted whenever there's a new LLM/API-facing verb, regardless of whether it reuses an existing service or needs a new one.
  - Actions and services are not 1:1: one action may orchestrate multiple services, and one service may be called by multiple actions.
  - When a service's internal outcome type gains a new variant, the action(s) translating it into an `ActionOutcome` should do so via an exhaustive `switch` (with an `assertNever` default) so an unhandled case is a compile error, not a silent gap. The service's outcome taxonomy and an action's public `failReasonSchema` are allowed to diverge deliberately (the action may collapse variants or add detail) — that's translation, not duplication.

## GameMaster / LLM integration layer

- `GameMaster` (`src/gamemaster/`) is meant to be a polymorphic, UI-facing contract — LLM-specific tooling lives entirely under `src/gamemaster/llm/`, not beside it.
- **Litmus test for whether something belongs under `llm/`**: would a hypothetical non-LLM `GameMaster` implementation need it? If it exists only because LLMs are stateless (need history replayed each call), only see text/JSON (need state rendered as prose), or only know tools by string name (need a name → `Action` registry), it belongs under `llm/`. This is why `tool/`, `snapshot/`, `instructions/`, and `conversation/` all live nested under `llm/` rather than at the top of `gamemaster/`.
- **`ToolCallDispatcher`** (`src/gamemaster/llm/tool/`) is the only component in the LLM layer that ever touches `GameSession`/`Action` — everything above it (conversation management, request assembly, the LLM client itself) only ever sees a `ToolResult`. Each dispatched tool call opens its own `GameSession.playTurn` (i.e. its own transaction, and its own tick) — so one LLM turn (one player input through to narration) can span *multiple* engine-level `playTurn` transactions when the model calls more than one tool.
- **Turn vocabulary** (`src/gamemaster/llm/turn/`, `.../lifecycle/`): a single player-input-to-narration exchange is a "turn," modeled as three types at increasing altitude, each translated into the next rather than reused as one shape:
  - `TurnDraft`/`DefaultTurnDraft` — the mutable, self-encapsulating working state of one in-progress turn. It owns its own `ConversationMessage` construction (`recordUserRound`, `recordToolRound`, `complete`) and exposes `toRequestMessages()` for building requests; nothing outside it ever builds a `ConversationMessage` by hand. Created only via the static `DefaultTurnDraft.start(priorMessages)` (constructor is private) — there's no separate factory class for this since it needs no dependencies.
  - `LLMRequestAssembler`/`DefaultLLMRequestAssembler` (`request/`) — the sole translation from a `TurnDraft` to the wire-format `LLMRequest` (adds `systemPrompt` + `tools`). Nothing else in the LLM layer touches `LLMRequest` directly.
  - `TurnLifecycle`/`DefaultTurnLifecycle` (`lifecycle/`) — brackets a turn around `SequentialLLMLoop.run`: `begin(state, rawInput)` starts a `TurnDraft` from `ConversationManager` history and records the raw input with the world snapshot appended; `end(result)` persists the finished turn's messages back into `ConversationManager` and returns the narration text. `SequentialLLMLoop` itself takes no message-composition dependency — it just mutates the `TurnDraft` it's given (`recordToolRound`/`complete`) each round and re-assembles a request via `LLMRequestAssembler`.
  - This intentionally mirrors the engine-side naming discipline: pick vocabulary that's unique to the layer/altitude it lives at (the engine owns "turn"/"tick" at the `playTurn`/`TurnCounter`/`OnTurnEffect` grain; the LLM layer owns `TurnDraft`/`TurnLifecycle`) rather than reusing a word like "Turn" or "Request" for two different-grained concepts.
