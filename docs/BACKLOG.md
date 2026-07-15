# Feature Backlog

A prioritized backlog for the text-adventure engine. Ordered so that **foundational
primitives land first** — each unlocks a cluster of later features with little new
engine code. Sizes are rough (S = a day-ish, M = a few days, L = a week+).

Grounding:
- **`src_old/` (prior implementation)** already modeled most of these — combat, quests,
  flags/conditions, item effects, trade, dialogue trees, player vitals/stats, save-load.
  It's a source of *shape* inspiration, not structure (per `CLAUDE.md`, don't imitate its layout).
- **Genre staples** (Zork/Inform/TADS lineage): light & darkness, containers & surfaces,
  wearables, score & win/lose, hunger/thirst, NPC schedules, hints.

### Two architectural constraints that shape sequencing
1. **The engine is deterministic and has no I/O, clock, or RNG** (`CLAUDE.md` → engine
   independence). Anything needing *time* (status effects, day/night, hunger) or *chance*
   (combat rolls, loot drops) must take an injected seam — a `TickSource` / `RandomSource`
   passed in from the boundary — never `Date.now()`/`Math.random()` inside `src/engine`.
   Land those seams **before** the features that depend on them.
2. **Adding a new *kind of thing* threads every layer in lockstep** (state + id, store pair,
   entity + factory, `Context` accessors, `Factories` entry, `NotFoundError`, transaction
   wiring). Prefer features that *enrich existing entities* over ones that add new entity
   types when the payoff is equal — they're dramatically cheaper.

---

## Tier 0 — Foundational primitives (do these first)

These are cross-cutting mechanisms that many later features consume. Highest leverage.

### ~~0.1 World flags & a condition system~~ — size: M  ⭐ highest leverage — ✅ DONE (`feat/world-flags`, `feat/condition-system`, `feat/condition-why-failed`)
A general key→value world-state store (`boolean | number | string`) plus a **data-driven
condition predicate** (`flagEq/gte/lte`, `hasItem`, `roomVisited`, `npcMood`, `and/or/not`,
`true/false` sentinels — the exact taxonomy `src_old/engine/condition` shipped).

Why foundational: conditions become the *reusable gate* for item visibility, blocked exits,
dialogue branches, quest objectives, and scripted events — so those features become **content,
not code**. Without it, every gated behavior is a bespoke `if`. This is the single most
formative item in the backlog.
- Depends on: nothing. Do first.
- Notes: model conditions as a plain evaluable domain type over `Context`; keep set-flag as an
  action/effect so the LLM can trigger world changes.

### ~~0.2 Per-turn tick / time source~~ — size: S–M — ✅ DONE (`feat/tick-time-source`; landed as the `TurnCounter`/`OnTurnEffect` seam, see `CLAUDE.md`)
A monotonically advancing turn counter (already implied by `createdAtTurn`/`lastInteractedTurn`
in `src_old`) exposed as an **injected `TickSource`**, plus a post-turn hook where
turn-scoped systems can run.

Why foundational: the seam that status effects, hunger/thirst, day/night, NPC schedules, and
quest timers all hang off. Cheap to build now, painful to retrofit later. (Cited as a canonical
example in the `develop-feature` skill.)
- Depends on: nothing.

### ~~0.3 Item economic & physical attributes~~ — size: S — ✅ DONE (`feat/item-economic-physical-attributes`)
Enrich `ItemState` with `value` (gold), `weight`, `takeable`, `droppable` (all present in
`src_old`'s `Item`; current state has none of them). Wire `takeable`/`droppable` into the
existing `pickUp`/`drop` actions.
- Depends on: nothing. Pure enrichment of an existing entity → cheap.
- Unlocks: trade, encumbrance, sellability.

### ~~0.4 Currency (player + NPC gold)~~ — size: S — ✅ DONE (`feat/currency-gold`, `Wallet` entity)
Add `gold` to `PlayerState` and to NPCs. A primitive, but its own item so the trade/economy
features build on a settled representation.
- Depends on: nothing.

---

## Tier 1 — Core mechanics on top of the primitives

### ~~1.1 Equip / unequip~~ — size: S — ✅ DONE (`feat/equip-unequip`, `checkInventory` shows equipped items)
`PlayerState.equipment` already has `weapon`/`armor` slots — the **actions are just missing**.
Add `equip`/`unequip` verbs, honoring item `type`.
- Depends on: item types (already present). Optionally item `stats` (0.x) for requirements.
- Notes: smallest real win; slots already modeled. (Cited in `develop-feature` skill.)

### 1.2 Item usage & effects  — size: M
A `use <item>` action dispatching a **data-driven effect** (`heal`, `damage`, `unlock`,
`revealItem`, `revealLore`, `applyBuff`, `poison` — `src_old/engine/item/UseEffect.ts`), with a
small effect-handler registry and `consumedOnUse`. Some effects (poison/buff) require the tick
source (0.2); ship the instantaneous ones first.
- Depends on: 0.1 (reveal/unlock via conditions), 0.2 (for over-time effects), player vitals (2.1) for heal/damage.
- Notes: this is a *new invariant set* → likely its own service; one `use` action orchestrating it.

### ~~1.3 Buying & selling (trade)~~ — size: M  ⭐ user-flagged foundational — ✅ DONE (`feat/shop-buy-sell`, `feat/shop-choice-menu`; `ShopState`/`Shop` entity, `buy`/`sell` actions)
NPC inventory entries with `forSale`/`price`/`quantity`, NPC `gold`, and a `trade` action with
`buy`/`sell` directions (`src_old/engine/actions/trade.ts` is a near-complete reference).
- Depends on: 0.3 (item value/droppable), 0.4 (currency), NPC inventory.
- Notes: NPC inventory is the new sub-model here; keep prices/gold out of narration (the LLM
  narrates the exchange, never the numbers — `src_old` annotated its schema for exactly this).

### ~~1.4 Give item to NPC~~ — size: S — ✅ DONE (`feat/give-item-to-npc`; general-purpose `NpcState.inventory`, `give` action)
A `give` verb transferring an item from player to NPC. Underpins quest turn-ins and gifting.
- Depends on: NPC inventory (from 1.3).

### 1.5 Containers & search  — size: M
Items/room features that hold other items and can be open/closed and optionally locked; a
`search`/`open` action to reveal contents. (Cited in the `new-action` skill.)
- Depends on: 0.1 (reveal conditions), existing lock/unlock (reuse).
- Notes: decide container = enriched item vs. new entity; reuse the existing `lock` entity.

### 1.6 Condition-gated exits & item visibility  — size: S–M
Let exits be blocked and items hidden behind a `Condition` (0.1), replacing/generalizing the
current single-key `lock`. E.g. an exit opens once a flag is set or an item is held.
- Depends on: 0.1.
- Notes: high content leverage for near-zero per-case code once 0.1 exists.

---

## Tier 2 — Character systems

### ~~2.1 Player vitals (health)~~ — size: S–M — ✅ DONE (`feat/player-vitals`; `Vitals`/`DefaultVitals` entity, `checkStatus` action)
`health`/`maxHealth` on the player, with a `checkStatus` action and health rendered as
**prose, not numbers** (`src_old` `HealthProse`). The precondition for heal/damage effects and combat.
- Depends on: nothing structural.

### 2.2 Attributes & derived stats  — size: M
Base attributes (`src_old` `PlayerAttributes`) → derived combat stats (`derivePlayerStats`),
with equipment contributing. Enables stat-gated equip requirements (the `TODO` in `src_old`'s equip).
- Depends on: 1.1 (equip), 2.1.

### 2.3 Status effects over time  — size: M
Active effects (buffs, poison, regen) that tick each turn and expire (`src_old` `ActiveEffect`
+ `EffectTickResult`). The first real consumer of the tick source.
- Depends on: 0.2 (tick), 2.1 (vitals), 1.2 (effects apply them).

### 2.4 Consumables: hunger / thirst (optional survival layer)  — size: M
Food/drink items and slowly-draining meters that tick down and penalize at zero. Genre staple;
purely opt-in per game.
- Depends on: 0.2, 2.1, 1.2.
- Notes: engine must let a consuming game **disable** this — keep it a configurable system, not baked in.

---

## Tier 3 — Content & progression systems

### 3.1 Quests & objectives  — size: L
Quests with stages, ordered objectives whose completion is a `Condition`, rewards, and optional
fail conditions (`src_old/engine/quest/*`). A quest-log/journal read action.
- Depends on: 0.1 (objective conditions), 0.2 (timers/fail), 1.4 (turn-ins), 0.4 (gold rewards).
- Notes: objectives evaluated at the post-turn hook; this is where 0.1 pays off most.

### 3.2 Dialogue trees, NPC mood & knowledge  — size: L
Move NPCs beyond a single `dialogue` string to condition-gated dialogue nodes, `mood`
(`friendly`→`hostile`), and knowledge topics unlocked by progress (`src_old/engine/npc/*`).
Integrates with the LLM `talkTo` narration.
- Depends on: 0.1 (node/topic gating).
- Notes: keep the *branching structure* in the engine; let the LLM handle surface phrasing.

### 3.3 Combat  — size: L  ⚠ needs an RNG seam
Turn-based combat: `attack`/`flee`/`startCombat`, attack types, modifiers, round logs, NPC
hostility and defeat (`src_old/engine/combat/*`). Requires an **injected `RandomSource`** to
keep the engine deterministic under a fixed seed.
- Depends on: 2.1, 2.2, 1.1, and a `RandomSource` seam (build the seam as its own small step first).
- Notes: land the deterministic RNG seam before any dice-driven feature.

### 3.4 Loot & NPC death  — size: M
NPCs drop a loot table on defeat; corpses/lootable inventory (`src_old` `LootEntry`).
- Depends on: 3.3, NPC inventory (1.3), RNG seam (for drop chances).

---

## Tier 4 — Session & world infrastructure

### ~~4.1 Save / load persistence~~ — size: M — ✅ DONE (`feat/save-load-persistence`, `FileSessionRepository`)
Serialize/restore committed `GameState` through the existing `SessionRepository` seam
(`src/persistence/` — already stubbed as the "in-memory now, files/DB later" home). File-backed
first. `src_old` had `GameStorage`.
- Depends on: nothing new; a natural fit for the existing seam.
- Notes: highest-value infra item; do early if playtesting sessions matter.

### 4.2 Score & win/lose conditions  — size: S–M
A `Condition`-driven game-over/victory check plus optional scoring — the classic Inform/Zork
"you have won/died" and points. Evaluated at the post-turn hook.
- Depends on: 0.1, 0.2.

### 4.3 Light & darkness  — size: M
Rooms can be dark; a carried/lit light source is required to `look` or act. Canonical Zork
mechanic; interesting because it re-gates existing verbs rather than adding one.
- Depends on: 1.2 (light source as usable item), 0.1.

### 4.4 NPC movement & schedules  — size: L
NPCs move between rooms on a schedule or in response to flags, driven by the tick.
- Depends on: 0.1, 0.2.

### 4.5 Scripted / ambient room events  — size: M
Triggers that fire on entering a room or when a condition flips (set a flag, reveal an item,
spawn an NPC line). Pure content once 0.1 + 0.2 exist.
- Depends on: 0.1, 0.2.

---

## Recommended first slice (a coherent MVP economy + interaction loop)

Delivers something playable and demonstrates the primitives paying off:

1. ~~**0.1 Flags & conditions** — the keystone.~~ ✅ DONE
2. ~~**0.3 Item attributes** + **0.4 currency** — cheap primitives.~~ ✅ DONE
3. ~~**1.1 Equip/unequip** — near-free win, validates the loop.~~ ✅ DONE
4. ~~**1.3 Buying & selling** — the user-flagged foundational feature, now cleanly supported.~~ ✅ DONE
5. ~~**0.2 Tick source** — land the seam before anything time-based.~~ ✅ DONE
6. ~~**4.1 Save/load** — makes iterative playtesting real.~~ ✅ DONE

The original MVP loop is complete. Next: pick a vertical (combat *or* quests) once 2.1 vitals and
the RNG seam exist.

---

## EPIC — The authoring SDK: expose the engine as an importable library

> This is the `CLAUDE.md` long-term direction ("primarily a TypeScript library/SDK for building
> text adventures, with a standalone game as a sample consumer") made concrete. It is an **epic**,
> not one feature — recorded here as sub-features with initial ideas to start thinking through.
> It cuts across the tiers above rather than sitting in one.

### Where authoring stands today (the gap this epic closes)
- **Worlds are hand-written raw `GameState` literals** (`src/app/sampleWorld.ts`): a large nested
  object wiring rooms → items/NPCs/exits **by bare string id**, with **no check that referenced
  ids exist**. A typo'd `destinationRoomId` or `keyItemId` is a silent runtime bug, not a
  compile/author-time error.
- **Running a story takes ~150 lines of boilerplate** (`src/main.ts`): constructing `GameSession`
  + a `Factories` map, an `ActionToolCatalog` with a per-action description, the Ollama client,
  request assembler, tool dispatcher, conversation manager, snapshot builder, turn lifecycle — all
  by hand, in the right order.
- **The package isn't a library yet**: `package.json` `name` is `"gunslinger"` and `main` points at
  `src/main.ts` (the CLI), with **no `exports` map, no `types`, no `.d.ts` build**. The barrel
  `index.ts` files exist but nothing defines an intentional *public* surface vs. internals.
- **Extension has no documented path**: `defineAction` and the `LLMClient` interface exist, but a
  consumer has no blessed way to register a custom verb, swap the LLM provider, author the system
  prompt, or hook per-turn logic.

### Target authoring experience (north star)
```ts
import { WorldBuilder, createGame, AnthropicProvider } from '@gunslinger/engine'; // names TBD

const world = new WorldBuilder()
    .room('entrance', { name: 'Entrance Hall', description: '...' })
    .room('courtyard', { name: 'Courtyard', description: '...' })
    .exit('entrance', 'north', 'courtyard')            // validated: both rooms must exist
    .item('iron_key', { name: 'Iron Key', type: 'key' })
    .placeItem('iron_key', 'entrance')
    .npc('hermit', { name: 'Ragged Hermit', ... }).placeNpc('hermit', 'courtyard')
    .startAt('entrance')
    .build();                                          // throws typed AuthoringError on dangling refs

const game = createGame({ world, provider: new AnthropicProvider({ model: 'claude-...' }) });
await game.run();                                      // sensible default CLI I/O, or drive it yourself
```

### Sub-features

#### E1. Public package surface & build/packaging  — size: M  ⭐ do first
Define the intentional public API and ship it as a consumable package: an `exports` map, generated
`.d.ts` types, ESM (already `type: module`), a real package `name`, semver discipline, and a
top-level barrel that re-exports **only** the supported surface (builders, `createGame`, action
authoring, provider interfaces) while keeping engine internals private. Split the CLI out of `main`.
- Depends on: nothing. Everything else in the epic ships *through* this surface.
- Notes: decide monorepo vs. single package now (see E6). The public/internal line is the real
  design work — most of `src/engine/**` stays internal behind the builders/facade.

#### E2. Fluent world/story authoring builder + referential-integrity validation  — size: L  ⭐
A `WorldBuilder` (and per-entity sub-builders) that replaces raw `GameState` literals with a
discoverable, typed, chainable API, and **validates at `build()`**: every exit destination, item
placement, NPC placement, lock `keyItemId`, and (later) condition/quest reference resolves to a
declared entity. Emits **typed authoring errors with actionable messages** ("exit `entrance:north`
→ unknown room `courtyrad`"), not a runtime `undefined`.
- Depends on: E1.
- Notes: this is the highest-value author-facing item. Keep it a thin, ergonomic layer that emits
  the same validated `GameState` the engine already consumes — it's DX, not new engine semantics.
  Grows automatically as new entity types land, so co-design it with the entity-threading pattern.

#### E3. High-level game facade / runtime  — size: M
A `createGame(...)` / `GameRunner` that collapses the ~150-line `main.ts` wiring into a few lines:
sensible defaults for factories, tool catalog (auto-derived from the registered actions), snapshot
builder, conversation manager, and turn lifecycle — each overridable. Decouple the run-loop from
stdin/stdout so the terminal REPL becomes one thin **I/O adapter** among possible others (the
"terminal now, possibly web later" note in `CLAUDE.md`).
- Depends on: E1; pairs with E2.
- Notes: the current `main.ts` becomes the reference CLI adapter built on this facade.

#### E4. Pluggable LLM provider abstraction  — size: M
Elevate the existing `LLMClient` interface into a first-class, documented extension point.
Ship the Ollama impl, add at least one hosted provider (**Anthropic** — see `claude-api` skill),
and let authors supply model/config or a fully custom client. Make the **system prompt /
instructions authorable** (today it's a hardcoded inline string in `main.ts` via
`StaticInstructionsProvider`) — tone, rules, and per-game guidance are author content.
- Depends on: E1, E3.
- Notes: keep provider SDKs wrapped behind the abstraction (the `CLAUDE.md` boundary rule); never
  let a provider SDK leak into engine or author code.

#### E5. Extension points for custom game logic  — size: L
The blessed paths for authors to inject their own rules:
- **Custom actions/verbs**: register a `defineAction` result plus its tool metadata through the
  facade (generalizes today's hand-built `ActionToolCatalog`).
- **Custom effects & conditions**: once the effect (1.2) and condition (0.1) systems exist, expose
  registries so authors add new `UseEffect`/`Condition` variants without forking the engine.
- **Lifecycle hooks**: per-turn / on-enter-room / on-state-change callbacks for scripted content
  (ties into 4.5 scripted events) — carefully, to preserve determinism (hooks are pure state→state).
- **Custom snapshot & narration shaping**: author-supplied `WorldSnapshotBuilder`/instructions.
- Depends on: E1, E3; the effect/condition hooks depend on 0.1 / 1.2.

#### E6. Content ↔ engine separation & an `examples/` consumer  — size: S–M
Physically separate the library from the sample game: move `sampleWorld.ts` + the CLI into an
`examples/` (or a separate package) that imports the library exactly as a third party would — this
is the ongoing regression test that the public API is actually sufficient and genre-agnostic.
- Depends on: E1, E2, E3.
- Notes: "dogfood the SDK to build the sample game" is the cheapest guard against the API drifting
  back into requiring internal access.

#### E7. Authoring DX & documentation  — size: M (ongoing)
A quickstart ("build & run a 3-room game in 30 lines"), JSDoc on the entire public surface, a
cookbook (add an item / lock a door / write a custom verb / swap the LLM provider), and typed,
readable authoring errors (from E2). Documentation is a deliverable of this epic, not an afterthought.
- Depends on: E1–E5 as they land.

### Suggested epic sequencing
`E1 (package surface)` → `E2 (world builder + validation)` → `E3 (game facade)` → then
`E4 (providers)` and `E6 (examples split)` in parallel → `E5 (extension points)` as the
effect/condition systems mature → `E7 (docs)` continuously.

---

## Deliberately out of scope (per "avoid grandiose")
- GUI / web front-end (engine stays UI-agnostic; terminal now).
- Multiplayer / networking.
- Procedural world generation.
- A full scripting DSL — the condition/effect data model (0.1, 1.2) covers most of the need
  without inventing a language.
