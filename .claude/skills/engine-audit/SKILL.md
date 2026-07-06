---
name: engine-audit
description: >-
  Use to audit the engine against this repo's settled architectural invariants. The
  central one: engine independence — src/engine depends only inward and never on
  gamemaster (LLM), cli (UI), persistence, or the outside world (I/O, randomness, time).
  Also checks genre-agnosticism, the entity/state split, the Zod/schema boundary,
  store-owned immutability, and the Turn vocabulary. Run before merging engine work, or
  as a periodic conformance check. Complements /code-review (bugs, simplification); this
  checks *architecture conformance*, which a generic review can't know.
---

# Auditing the engine's architecture

This skill checks whether the code still obeys the **settled** rules in CLAUDE.md — the ones a
generic reviewer has no way to know. It is a **read-only audit that produces a ranked findings
report.** Do not fix anything unless the user asks; if they do, fix after reporting, smallest change
that restores the invariant.

**Don't duplicate CLAUDE.md.** Every rule below is *defined* there ("Design philosophy", "Engine
architecture patterns", "Code style", the `llm/` litmus test). This skill owns the *ordered check
process and the grep patterns*, not the rationale — cite the rule, don't re-argue it.

**This skill is a derivative of CLAUDE.md and drifts out of date when CLAUDE.md changes.** The checks
here encode CLAUDE.md's *current* "Engine architecture patterns" / "Design philosophy" sections (and
the ESLint boundary rules mirror §1). When those sections change — a new layer, a settled decision
that was provisional, a renamed vocabulary tier — revisit this skill and `eslint.config.js` so they
don't enforce stale rules (the exact rot CLAUDE.md warns about for `.agent/` and `src_old/`). If you
find CLAUDE.md and the code disagree, CLAUDE.md's *settled* rules win, but a *provisional* note losing
to the code is a signal to update CLAUDE.md — surface it, don't silently pick a side.

**Scope first — default to the diff, don't ask.** Run `git diff main...HEAD --stat` (or
`git diff origin/HEAD... --stat`) yourself and audit that diff; only sweep the **whole engine** when the
user explicitly asks for a full conformance pass or the diff is empty. A diff audit only reports invariants
the diff could have broken; a full audit sweeps everything. Most invariants below are about **source** —
hold test files (`*.test.ts`, `*.test.utils.ts`) to a lighter bar and say so in a finding rather than
failing them outright.

**Known intentional states — do NOT flag these.** A conformance tool that cries wolf gets ignored, and
CLAUDE.md deliberately leaves some things in a transitional state. Before reporting, filter these out:

- **`persistence/` is unwired on purpose.** `SessionRepository`/`InMemorySessionRepository` has no
  caller in `engine/` or `gamemaster/` yet — that's the intended seam for "files/DB later," not dead
  code. Don't report it as unused.
- **The `Action` shape is provisional.** `defineAction`/`Verdict`/the Zod success-fail union were
  carried from `src_old/` as a *starting point* and are expected to change. Note friction if you see
  it, but don't report the shape itself as a violation.
- **One action per turn is deliberate.** `ActionExecution` enforcing exactly one action per
  transaction is a chosen constraint, not a missing feature.
- **`src_old/` and `.agent/` are stale by design** and excluded from lint — never audit them.

More broadly, **calibrate strictness to how settled the rule is.** Hard-fail the settled invariants
(engine independence, layer boundaries, entity/state split, determinism); for anything CLAUDE.md marks
provisional, *note* it as an observation rather than a violation. When unsure whether something is an
intentional exception, surface it as a question, not a finding.

---

## 1. Engine independence — the load-bearing check

**This is the central invariant: `src/engine/**` is the deterministic core, and the dependency arrow
points *only inward*.** Everything else — `gamemaster/` (LLM), `cli/` (UI), `persistence/` (storage) —
depends on the engine; the engine must never depend on, name, or reach for any of them. It must also
never reach for the *outside world* those layers own (I/O, randomness, wall-clock time), because a
dependency on the environment is the same violation wearing a different hat (CLAUDE.md "Determinism:
the engine is the sole authority on game state"; "clear boundaries: UI ↔ persistence ↔ engine").

A clean engine imports **only** other `src/engine/**` files, `src/utils/**`, and `zod` (schemas only).
Nothing else.

**The import-based half of this is now hard-enforced by ESLint** (`no-restricted-imports` in
`eslint.config.js`, blocking outer-layer + LLM/UI/IO imports from `src/engine/**`, and Zod outside
`action/**`), so a boundary breach fails the pre-commit gate — it should never reach an audit. That
makes checks **1a–1c redundant with lint**: run them only as a belt-and-suspenders sweep, or when lint
itself may be misconfigured. **1d (determinism) and 1e (reverse boundary) are NOT import-based, so lint
can't see them** — those are the checks this audit genuinely still owns; run them every time.

Run these from repo root; **quote `--include` globs** (unquoted `*.ts` gets eaten by zsh). Prereq: both
lint and these greps assume imports are relative or bare — `tsconfig` has **no path aliases** today; if
`paths`/`baseUrl` get added later, extend both the ESLint patterns and these greps to resolve them.

```bash
# 1a. No bare import except zod. The ONLY third-party/stdlib module engine SOURCE may import is
#     `zod` (and only in action/** — check 2b enforces where). Any other bare import — an LLM SDK
#     (ollama), a UI lib (blessed, readline), storage/IO (node:fs, a db driver) — is a leak.
grep -rnE "from '[^.'][^']*'" src/engine --include='*.ts' | grep -v '\.test\.' | grep -vE "from 'zod'"   # expect empty

# 1b. No relative import escapes upward into a sibling layer.
grep -rnE "from '(\.\./)+(cli|gamemaster|persistence)(/|')" src/engine --include='*.ts'                   # expect empty

# 1c. Any mention of the outer layers at all inside the engine (imports, type names, comments, strings).
grep -rniE 'gamemaster|persistence|\bollama\b|blessed|LLM|GameMaster' src/engine --include='*.ts' | grep -v '\.test\.'  # expect empty

# 1d. Purity / determinism — engine SOURCE must not touch randomness, wall-clock, env, I/O, or console.
grep -rnE "Math\.random|Date\.(now|UTC)|new Date\(|process\.(env|argv|stdout|stdin)|console\.|require\(|node:(fs|readline|child_process|net|http)" \
  src/engine --include='*.ts' | grep -v '\.test\.'                                                        # expect empty

# 1e. Reverse side of the boundary: on the consumer end, ToolCallDispatcher is the ONLY gamemaster
#     component allowed to touch GameSession/ActionExecution/Action. A leak here means an outer layer
#     is reaching around the seam into the engine's entry points.
grep -rln "GameSession\|ActionExecution" src/gamemaster --include='*.ts' | grep -v '\.test\.' | grep -v '/tool/'  # expect empty
```

Any hit here outranks everything in §2–§3. A genuinely new boundary dependency (e.g. a second
schema library) is a deliberate architecture decision, not a routine addition — flag it for a human,
don't silently allowlist it. Test files get a lighter bar (they legitimately import `chai`/`mocha`/
`sinon`, and may build fixtures), but engine *source* has zero tolerance.

## 2. Other mechanical checks (grep — fast, high-confidence)

Each names the CLAUDE.md rule it enforces and what a clean result looks like.

```bash
# 2a. Genre-agnosticism — the engine must assume no specific story/world/content.
#     Source hits are findings. Test fixtures legitimately use arbitrary names/ids (a test NPC
#     'hermit', a player 'Roland'), so filter them out here rather than reporting low-sev noise;
#     re-scan tests only if you suspect genre lock-in leaked into a shared fixture.
grep -rniE 'gunslinger|dark tower|roland|gilead' src/engine --include='*.ts' | grep -v '\.test\.'

# 2b. Zod/schema boundary — within the engine, only action/** (+ utils/schema/**) may import zod;
#     gamemaster SOURCE must reach schemas through Schema/toJsonSchema, never zod directly.
grep -rln "from 'zod'" src/engine | grep -vE 'engine/(action|.*\.test\.)'   # expect empty
grep -rln "from 'zod'" src/gamemaster | grep -v '\.test\.'                   # expect empty

# 2c. Store-owned immutability — no Immer/produce()/manual deep-clone at call sites.
grep -rnE "immer|produce\(|structuredClone" src/engine --include='*.ts' | grep -vE 'store/|\.test'

# 2d. TDD colocation — every behavioral source file has a sibling *.test.ts. Target classes
#     (the behavioral units); pure interface/type/union files (e.g. Action.ts, *State.ts,
#     outcome unions) legitimately have no test, so don't list them. Trivial error subclasses
#     and no-op stubs in the result can be waved off — real logic-bearing classes cannot.
for f in $(grep -rln '^export class \|^class ' src --include='*.ts' | grep -v '\.test\.'); do
  test -f "${f%.ts}.test.ts" || echo "$f"
done
```

## 3. Judgment checks (read + reason — grep can't settle these)

For each, open the relevant files and decide. Rank a violation by how load-bearing the invariant is.

- **Test legitimacy — not just existence.** §2d proves a `*.test.ts` *exists*; it says nothing about
  whether the test is *honest*, and TDD/Clean Code is CLAUDE.md's #1 non-negotiable — so read the
  tests, don't just count them. Concrete smells this repo has produced: a parameterized test that
  passes while exercising the wrong subject (a hardcoded `repository.room` inside an `item` iteration
  → the item path was never tested); assertions that leak internals or under-specify
  (`deep.equal({…, message: undefined})` vs. the cleaner `deep.include({ result, reason })`);
  over-specified fakes that assert collaborators the test never uses; and un-exercised branches
  (a `.map` over a collection only ever fed one element; a service outcome variant with no
  translation test). A test that would still pass if the behavior it names broke is worse than no
  test — flag it. (This is a read; `npm test` passing does not settle it.)
- **Entity vs. state split.** `src/engine/state/**` must be plain data types only — no classes,
  methods, or behavior; no imports from `entity/`. `src/engine/entity/**` holds the behavior and
  must not re-declare the plain state shapes. (CLAUDE.md "Entity vs. state split".)
- **Encapsulation, not data bags.** Entities expose meaningful operations, not public setters that
  let callers reach in and mutate state. Flag setter-shaped accessors on domain entities.
- **Explicit dependencies — no self-constructed collaborators.** A component's dependencies should be
  visible from its constructor/interface alone; nothing should quietly `new` up its own collaborators
  or reach for a hidden global (CLAUDE.md "Explicit dependencies… favor dependency injection"). Grep
  for construction sites — `grep -rnE 'new (Default)?[A-Z]\w+(Service|Store|Client|Manager)\(' src/engine src/gamemaster --include='*.ts' | grep -v '\.test\.'` — then judge each: a **constructor
  default parameter** (`constructor(private svc: LockService = new DefaultLockService())`) and the
  `main.ts` composition root are the *sanctioned* patterns; a `new` **inside a method body** or at
  module top-level, smuggling in a collaborator the caller can't see or substitute, is the violation.
- **`llm/` litmus test.** Anything that exists *only* because LLMs are stateless / see only text /
  know tools by string name belongs under `src/gamemaster/llm/`, not beside it. Check the top of
  `src/gamemaster/` for something that fails the test. (CLAUDE.md "GameMaster / LLM integration layer".)
- **Turn vocabulary.** No new type reuses "Turn"/"Request"/"Execution" for a different-grained
  concept than the existing `ActionExecution` (engine) vs `TurnDraft`/`TurnLifecycle`/`LLMRequest`
  (llm) ladder. A name collision across altitudes is the exact mistake CLAUDE.md calls out.
- **Exhaustive translation.** Where an action translates a service outcome union into an
  `ActionOutcome`, it must use a `switch` with an `assertNever` default (an unhandled variant should
  be a compile error). Flag any `if/else` chain or missing default doing this job.
- **Service vs. action vs. method.** A *new service* is only justified when its invariants differ
  from every existing service (not just because a new verb appeared). Apply CLAUDE.md's decision
  framework to any newly-added service.
- **Make illegal states hard to represent.** New optional fields that the domain actually always
  requires, or runtime checks that a stricter type would obviate, are findings.
- **Naming & comments.** `Default`-prefixed class where a more descriptive adjective fits
  (`ActionToolCatalog`, not `DefaultToolCatalog`); comments that restate *what* the code does rather
  than a non-obvious *why*. (CLAUDE.md "Code style".)

## 4. Compose the generic pass

Cover the bug-and-cleanup axis with **`/code-review`** on the same scope so this audit can stay focused on
architecture conformance — don't re-derive it here. **But don't blindly re-run it:** if `/code-review`
already ran on this diff this session (e.g. `develop-feature` Phase 3 runs it just before invoking this
audit), cite that result instead of running it again. Only run it here when it hasn't already covered this
scope. Either way, note in your report that it ran and fold anything architectural it surfaced into the
findings.

## 5. Report

Emit a single ranked list, most load-bearing invariant first (an engine-independence breach from §1
is top severity by definition). For each finding:

- **Invariant** — the CLAUDE.md rule, named.
- **Location** — `file:line` (clickable).
- **What** — the violation in one sentence, plus the concrete blast radius if it spreads.
- **Severity** — `source` violations outrank `test`-fixture nits; a broken layer boundary outranks a
  naming nit. Call low-severity test-fixture items out *as* low so they don't drown real ones.
- **Fix** — the smallest change that restores the invariant (don't apply unless asked).

If everything holds, say so plainly and list what was checked — a clean audit is a real result, not
an empty one. End with the current known-clean baseline so the next run has a reference point.
