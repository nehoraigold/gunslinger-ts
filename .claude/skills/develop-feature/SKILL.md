---
name: develop-feature
description: >-
  Use when handed a feature to build end-to-end — e.g. "add a time-passing
  mechanism that advances every turn", "let the player equip a weapon". Runs a
  gated workflow: scope it with the user as PM (approve a functional spec), design
  it as architect (approve a technical design), then implement TDD, verify, and
  open a PR for review. The user approves *what* and *how* before any code is written.
---

# Developing a feature, end to end

This is the top-level workflow for a non-trivial feature. It orchestrates the other skills and adds two
things they don't: a **product-scoping gate** and a **PR hand-off**. The user is the product manager and
the reviewer; you scope with them, design with them, then build autonomously to a PR they review.

**Two hard gates — you cannot proceed past either without explicit user approval:**

```
Phase 0 SCOPE  →  [GATE 1: functional spec]  →  Phase 1 DESIGN  →  [GATE 2: technical design]
   →  Phase 2 IMPLEMENT  →  Phase 3 VERIFY & REVIEW  →  Phase 4 PR  →  hand off
                                     ▲
        GATE 2 loops back to GATE 1 if design surfaces a product question
```

**Don't duplicate CLAUDE.md or the skills you delegate to.** This skill owns the *ordered gated
process*. The architecture rules live in CLAUDE.md; the per-layer build discipline lives in `new-action`;
verification, review, boundary conformance, and PR mechanics live in `/verify`, `/code-review`,
`/engine-audit`, and `open-pr`. Reference them; don't restate them.

---

## Phase 0 — Scope (you are the engineer; the user is PM)

**Investigate before you ask.** Read the relevant code first so your questions are informed and you
never ask what the codebase already answers (mine `src_old/` for prior art per CLAUDE.md). Then work out
what's genuinely a *product* decision and surface only those.

- Use `AskUserQuestion` for real either/or product choices — not implementation. (For a time mechanism:
  abstract ticks vs. in-world hours? every action costs the same or per-verb? do read-only actions like
  `look` advance it? is time visible in the player-facing snapshot? does anything *observe* time yet, or
  is this just the substrate?)
- Draft a short **functional spec**: player-facing behavior, success/failure cases, edge cases, and an
  explicit **non-goals** list. No implementation detail — this is *what*, not *how*.

### GATE 1 — the user approves the functional spec

Present the spec and **wait for approval.** Do not design against an unapproved spec. Keep the approved
spec (scratch markdown is fine) — it seeds Phase 1's yardstick and the eventual PR body.

## Phase 1 — Design (you are the engineer; the user is architect)

Classify the feature's **shape**, because that decides how it's built:

- **A single new verb** (player/LLM-facing action) → the design and build are largely `new-action`'s job;
  invoke `/new-action` and let it run its own plan-mode design gate, then resume this workflow at Phase 3.
- **A cross-cutting mechanism** (new state advanced by the turn lifecycle, a new service, a rule touching
  every turn — e.g. time passing) → design it here, applying CLAUDE.md's "service vs. action vs. method"
  and "entity vs. state split" frameworks.
- **A new entity/domain type** (a new *kind of thing* in the world — e.g. NPCs, alongside items and rooms)
  → it threads through *every* engine layer in lockstep: a state type + id, a store pair
  (`XStore`/`XsStore`), an entity + factory, a `Context` accessor + `Factories` entry, a `Transaction`
  store + `commit()` line — plus surfacing (`look`, the world snapshot) and each verb that acts on it.
  Design it here; build each verb by `new-action`'s checklist even though you're not invoking the skill.
  See CLAUDE.md's "adding a new entity type" note for the exact layer-by-layer checklist.
- **Content** (new rooms/items/NPCs in the sample world) → keep it out of the engine; it's a consumer change.
- **Mixed** (most non-trivial features — NPCs were *entity type + two verbs + surfacing*) → decompose into
  the shapes above and handle each part in its own mode. Don't force-fit a feature into one shape; name its
  parts and sequence them (entity type first, then its verbs, then surfacing).

Produce a **technical design** that traces every choice back to an approved spec line — no *new* product
decisions here:
- State/type changes (keep new fields required unless the domain truly makes them optional).
- Where the logic lives and why (e.g. a `TimeService.advance` called from the turn lifecycle after a
  successful commit — name the alternative you rejected and why).
- **Blast radius** — every file touched; in particular a new *required* state field breaks every fixture
  (`GameState.test.utils.ts`, `sampleWorld.ts`, entity/action stubs) — enumerate them now.
- Determinism check — same state + same action ⇒ same result; no randomness/wall-clock leaking in.
- Test plan — the `describe`/`it` cases you'll write first.

### GATE 2 — the user approves the technical design

Present the design in **plan mode** and wait for approval. If the design surfaces a product question or
shows a spec choice is infeasible/expensive, **loop back to GATE 1** — don't resolve it yourself.

> Entering plan mode overlays its *own* Explore/Plan sub-workflow. You've usually already done that work
> in Phase 0 (investigate) and Phase 1 (design) — so when the design is settled, write the plan file and
> call `ExitPlanMode` directly. Don't re-run fan-out Explore/Plan agents over ground you've already
> covered; that's the expensive path. Reserve the agents for a feature you genuinely haven't explored yet.

## Phase 2 — Implement (TDD, autonomous)

Build test-first, in dependency order (state → entity → service → lifecycle/action → fixtures → wiring),
per CLAUDE.md ("Non-negotiable priorities", "Testing conventions", "Code style"; note **avoid comments**).
Follow the approved design; if reality forces a material deviation, pause and flag it rather than silently
diverging.

**Required checkpoint — land the state/type change first, then run `npm run typecheck` immediately.** Treat
the resulting error list as your *authoritative* fixture worklist: a new required field breaks every literal
that builds that type (fixtures, sample world, entity/action stubs, LLM-layer test factories), and typecheck
enumerates them exactly. Fix that list before writing any behavior. This is the single highest-leverage step
in the whole implementation — it converts "the blast radius is somewhere in dozens of files" into a precise
to-do list — so don't skip or defer it. A mechanical, repeated edit across many fixture files (e.g. adding
the same field to every call site) is a legitimate place for one careful scripted pass, re-verified with
typecheck afterward.

## Phase 3 — Verify & self-review

Run all of, and fix what they surface, before involving the user again:
- **`/verify`** — observe the feature actually running (the project verify skill has the drive recipes).
- **`/code-review`** — correctness / simplification / efficiency on the diff. For a small diff you authored
  in this session, its inline fast path is fine — you don't need the full multi-agent fan-out.
- **`/engine-audit`** — architecture conformance (independence, boundaries, entity/state split, the
  Turn-vocabulary and DI checks). The lint gate already hard-blocks boundary breaches. Run `/code-review`
  **before** it and let the audit cite that result — the audit's §4 otherwise re-runs code-review on the
  same diff, doubling the work.
- The pre-commit gate (`typecheck` + `test` + `lint`) — clean. This gate is the **single definition of
  done** that `/verify` and `open-pr` also reference; run it once here, don't re-litigate it downstream.

(Tracking these phases with the task tools is optional — the two gates and this checklist are the real
checkpoints; ignore the "consider TaskCreate" nudges if you're keeping state in the conversation.)

## Phase 4 — Open the PR

Invoke **`open-pr`**. Seed its PR body from the approved spec (Phase 0), the approved design (Phase 1),
the test plan, and the `/verify` evidence (Phase 3). It branches off `main`, commits with the session's
trailers, and opens the PR for review. **It does not merge — the review is the user's.**

## Hand off

Report the PR URL, a summary of what shipped, the key decisions and their rationale, and anything left
for the reviewer's attention or deferred to a follow-up.
