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
- **Content** (new rooms/items in the sample world) → keep it out of the engine; it's a consumer change.

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

## Phase 2 — Implement (TDD, autonomous)

Build test-first, in dependency order (state → entity → service → lifecycle/action → fixtures → wiring),
per CLAUDE.md ("Non-negotiable priorities", "Testing conventions", "Code style"; note **avoid comments**).
Run `npm run typecheck` right after the state change to enumerate the fixture blast radius. Follow the
approved design; if reality forces a material deviation, pause and flag it rather than silently diverging.

## Phase 3 — Verify & self-review

Run all of, and fix what they surface, before involving the user again:
- **`/verify`** — observe the feature actually running (the project verify skill has the drive recipes).
- **`/code-review`** — correctness / simplification / efficiency on the diff.
- **`/engine-audit`** — architecture conformance (independence, boundaries, entity/state split, the
  Turn-vocabulary and DI checks). The lint gate already hard-blocks boundary breaches.
- The pre-commit gate (`typecheck` + `test` + `lint`) — clean.

## Phase 4 — Open the PR

Invoke **`open-pr`**. Seed its PR body from the approved spec (Phase 0), the approved design (Phase 1),
the test plan, and the `/verify` evidence (Phase 3). It branches off `main`, commits with the session's
trailers, and opens the PR for review. **It does not merge — the review is the user's.**

## Hand off

Report the PR URL, a summary of what shipped, the key decisions and their rationale, and anything left
for the reviewer's attention or deferred to a follow-up.
