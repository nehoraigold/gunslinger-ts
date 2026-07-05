---
name: new-action
description: >-
  Use when adding a new player/LLM-facing action (verb) to the game engine —
  e.g. "add a look action", "create a talk-to-NPC action", "let the player
  search a container". Walks intent → design (behind a plan-mode approval gate)
  → TDD implementation → verification. Optionally seeded with a name via
  `/new-action <name>`.
---

# Creating a new engine action

An **action** is the concrete, LLM/API-facing way to interact with the game engine — one verb the
player can invoke (`move`, `pickUp`, `look`). This skill takes a new action from intent to a
verified, wired-in implementation.

**Scope: this skill creates one action.** New services, or new functionality on existing services,
are a *consequence* of the action that needs them — design and build them inline as part of this
workflow, not as a standalone deliverable. There is no separate "new service" skill.

**Do not duplicate CLAUDE.md.** The architecture rules, the service-vs-action decision framework,
code style, and TDD expectations all live there — reference them, don't restate them. This skill
owns the *ordered process*, not the design principles.

---

## 0. Name and seed the intent

- If invoked as `/new-action <name>`, take `<name>` as the starting point.
- If no name was given, **this is the first task**: clarify what the action is before anything else.
  Ask the user what the player is doing in the world and for a couple of concrete story examples,
  then land on a concise `camelCase` verb consistent with existing names (`checkInventory`,
  `pickUp`, not `check_inventory` or `PickUpItem`).

## 1. Investigate — answer from the code, don't ask what you can read

Before forming any opinion, gather context:

- **Prior art in `src_old/`:** grep for the same or a similar action (e.g. `src_old/engine/actions/`).
  It often reveals intent and which state fields are worth porting — mine it for *ideas*, never for
  structure (see CLAUDE.md "Legacy / stale references").
- **The closest existing action to mirror.** Read it and match its shape:
  - `src/engine/action/checkInventory/CheckInventoryAction.ts` — read-only query, `z.void()` input,
    `z.never()` failure, reads straight from `Context` (no service).
  - `src/engine/action/move/MoveAction.ts` — service-backed; translates a service outcome into an
    `ActionOutcome` via an exhaustive `switch` + `assertNever`.
  - `src/engine/action/unlock/UnlockAction.ts` — mutates entity state through a service.
  - `src/engine/action/look/LookAction.ts` — read-mostly query that also flips one small flag.
- **The Action contract:** `Action<InputT, OutcomeT>` (`Action.ts`), `Schema<InputT>` via `ZodSchema`,
  `defineActionOutcome`, and the `Verdict.succeed/fail` helpers.
- **CLAUDE.md** — especially "Engine architecture patterns" (the *service vs. action vs. existing
  method* decision framework) and "Design philosophy."

## 2. Clarify intent, scope, and architecture

Work these out yourself from the investigation above. **Only surface to the user what is genuinely
ambiguous or a product/design decision** — do not ask what the codebase already answers. Over-asking
is the failure mode here.

- **Intent:** what the player is doing; example moments in the story.
- **Scope:** inputs and outputs; what state (if any) it mutates; success and failure conditions.
- **Architecture:** which services it uses; whether a new service or a new method on an existing one
  is warranted (apply CLAUDE.md's decision framework — a new service only when the *invariants*
  differ); what changes to state types, stores, or entities are needed.

## 3. Propose the design — behind a plan-mode gate

Enter plan mode and present the proposal, then **wait for approval before writing code.** The
proposal must contain:

- **High-level overview** — a concise explanation of the action.
- **Action signature** — name, input schema, success-data schema, and failure cases.
- **Service changes** — any new service or change to an existing one, and its new behavior (or
  "none — reads directly from `Context`").
- **State & entity changes** — any new/changed state types, stores, or entity accessors/behavior.
- **Reference action** — which existing action this one is modeled on.
- **Blast radius** — every file the change touches. In particular, **a new *required* field on a
  state type breaks every fixture and mock that constructs it** (`GameState.test.utils.ts`,
  `sampleWorld.ts`, entity/action test stubs) — enumerate these now so it's not a surprise.
- **Test plan** — the `describe`/`it` cases you'll write first (TDD).
- **Open design questions** — anything still unresolved.

## 4. Implement (TDD)

Write tests first or alongside — never leave a change untested. Follow all of CLAUDE.md
("Non-negotiable priorities", "Testing conventions", "Code style"; note the **avoid-comments** rule).
Build in dependency order so each layer compiles before the next:

1. **State** (`src/engine/state/…`) — add/extend the plain data types. Keep new fields required
   unless the domain truly makes them optional ("make illegal states hard to represent").
2. **Entity** (`src/engine/entity/…`) — expose the new state through meaningful accessors/behavior
   (encapsulate; no data-bag setters). Add colocated tests for new accessors.
3. **Action** (`src/engine/action/<name>/<Name>Action.ts` + `.test.ts`) — colocated. Mirror the
   reference action. Translate any service outcome with an exhaustive `switch` + `assertNever`.
4. **Fixtures & mocks** — update every construction site the blast radius named. Run
   `npm run typecheck` right after the state change to get the exact list.
5. **Wiring** — register the action in `src/main.ts`'s `ActionToolCatalog` with a clear LLM-facing
   `description`, and add it to the `SYSTEM_PROMPT` tool list. (Actions are imported directly in
   `main.ts`; there's no central action registry to update.)

## 5. Verify

Run all of, and fix anything that fails:

- `npm run typecheck` — run this *early* (right after the state change) to enumerate the fixture blast
  radius, then again at the end.
- `npm test` — Mocha; confirm the new specs actually ran.
- `npm run lint` (`npm run lint:fix` for autofixable formatting).
- `npm run build` — esbuild bundle.
- **Smoke test through the real engine** — drive the action end-to-end via `GameSession.playTurn`
  (a throwaway `npx tsx` script), not just unit tests. Exercise state persistence across a committed
  turn where relevant. Delete the script afterward.

The pre-commit hook (husky) already gates typecheck + tests + lint, so a clean run here means a
clean commit.

## 6. Summarize

Report: what was checked (with results), the action's final signature, the key design decisions and
their rationale, and any follow-ups deferred.
