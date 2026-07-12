---
name: address-review
description: >-
  Use to act on a human's review comments on an open PR — fetch the comments,
  make the code changes the directives call for, answer the questions, re-run the
  gate, push, and reply to each thread in-line. The "after review" bookend to
  open-pr. Reconstructs its context from the PR itself, so it works cold (no live
  agent memory needed). Never merges; the human still owns the merge.
---

# Addressing PR review comments

Takes an **open PR that a human has reviewed** and turns their comments into pushed changes plus a reply
on every thread. This skill owns the *review-response loop*; it does **not** decide the work is done and
it **never merges** — the reviewer re-reviews and merges.

It's the mirror of `open-pr`: that skill opens the PR outward, this one closes the review loop. It
deliberately rebuilds context from the PR (comments + diff), so it runs the same whether you authored the
PR minutes ago or are picking up someone else's cold — **don't rely on remembered context; read the PR.**

**Preconditions:**
- An open PR with at least one review comment. `gh auth status` must be logged in (it's interactive — if
  not, ask the user to run `! gh auth login`; don't script the login).
- You can check out the PR branch and run the gate. If the branch lives in a worktree without
  `node_modules`, see the husky note in step 4.

**Invocation:** `/address-review <PR#>` (default repo `origin`), or with no argument on the PR for the
current branch (`gh pr view --json number`).

---

## 1. Fetch the comments — with structure intact

Pull the review data yourself; don't rely on a human pasting it. The three surfaces are distinct:

```bash
gh pr view <PR#> --json number,headRefName,comments        # top-level PR conversation comments
gh api repos/<owner>/<repo>/pulls/<PR#>/comments \
  --jq '.[] | {id, path, line: (.line // .original_line), in_reply_to_id, body, user: .user.login}'
gh api repos/<owner>/<repo>/pulls/<PR#>/reviews \
  --jq '.[] | {user: .user.login, state, body}'            # review summary bodies (APPROVE/REQUEST_CHANGES/COMMENT)
```

- The **inline** comments (second call) are the ones anchored to `path:line` — those are the actionable
  ones. Each has a stable `id` you'll reply to.
- **Drop replies-to-replies:** filter to top-of-thread comments (`in_reply_to_id == null`) so you address
  each thread once, not each message. A prior reply of yours in a thread is not a fresh ask.
- Note the review `state`: `CHANGES_REQUESTED` means the reviewer expects a re-review; a bare `COMMENTED`
  may be lighter-touch. It doesn't change your job, but it sets the bar for "am I done."

## 2. Classify every comment before touching code

This is the judgment step the skill exists to protect — **do it explicitly, one comment at a time.** Sort
each into:

- **Directive** — "rename X to Y", "throw a named error here", "remove this file". → make the change.
- **Suggestion** — "consider caching this", "might be cleaner as…". → make it if you agree; if you don't,
  a *reasoned reply* is the deliverable, not a change.
- **Question** — "trade-offs considered?", "why this over X?". → the answer is a **reply, not an edit.**
  Do not rewrite code to pre-empt a question. Mis-reading a question as a mandate is the single most
  common failure here and produces unwanted churn.

Write down (scratch is fine) the verdict + planned action per comment — that list becomes your step-5
reply script and your "everything addressed" checklist.

## 3. Make the changes (TDD, same bar as any engine work)

Check out the branch (`gh pr checkout <PR#>` if you're not already on it) and apply the directives/accepted
suggestions under the normal discipline — CLAUDE.md rules, tests first or alongside. This skill doesn't
restate that; `new-action` and CLAUDE.md own it. A few review-specific patterns:

- **Discover the convention before writing new structure.** When a comment says "follow how we do X
  elsewhere" (e.g. "make a named error like the others"), grep the neighborhood and mirror it
  (`src/engine/error/*NotFoundError.ts` + its barrel is the worked example) — don't invent a shape.
- **Cross-cutting renames: grep, edit, grep again.** For a field/symbol rename, `grep -rn <old> src/`,
  change every hit (state, entity, fixtures, tests, `sampleWorld.ts`), then re-grep to prove zero remain —
  watching for legitimate false hits (a "Golden rule" comment shouldn't be rewritten by a `gold` rename).
- **"This file doesn't belong in the PR" is usually a git-history problem, not a `rm`.** If the diff
  carries an unrelated file, deleting it just adds a spurious deletion to the diff. Check for stray
  commits first: `git log origin/main..HEAD --oneline`. If the file rode in on a base-branch/rebase issue
  (branch based on a local commit ahead of `origin/main`), fix it at the root —
  `git rebase --onto origin/main <stray-commit>` — then confirm with `git diff origin/main --stat` that
  the file is gone. Only `rm` a file that your change genuinely added by mistake.

## 4. Re-run the gate and verify

- `npm run typecheck && npm test && npm run lint` — all green. The husky pre-commit hook re-runs
  lint-staged + typecheck + test on commit; **never `--no-verify`** (a blocked commit means it's not done).
- **Worktree husky gap (repo-specific):** a git worktree has no `node_modules`, so the hook's
  `./node_modules/.bin/lint-staged` fails with code 127. Symlink the main checkout's `node_modules` into
  the worktree so the *real* hook runs, then **remove the symlink before finishing** so it isn't reported
  as an untracked change. **Don't `git add -A` while the symlink exists** — it stages the symlink; stage
  explicit paths (as `open-pr` does) or `git restore --staged node_modules` before committing.
- **Lint warnings: diff the count, don't fail on any.** There are 3 pre-existing `no-console` warnings in
  `main.ts` that aren't yours — compare against baseline; only *new* warnings are regressions.
- **Re-verify at runtime when a change touches a runtime path** (a rename, a new thrown error, a behavior
  change) via the `/verify` Surface-1 recipe — a throwaway `tsx` driver, deleted after. A pure test-only
  or comment change doesn't need it.

## 5. Commit, push, reply in-thread

```bash
git commit            # imperative subject; session trailers per open-pr step 3
git push --force-with-lease origin <branch>      # --force-with-lease (never plain --force) after rebase/amend
```

Then reply to **each** thread you triaged in step 2 — **in-thread, never top-level.** The detached
`gh pr comment` is wrong here; use the replies endpoint keyed by the parent comment id:

```bash
gh api repos/<owner>/<repo>/pulls/<PR#>/comments/<COMMENT_ID>/replies -f body='...'
```

Keep each reply to 1–2 sentences: for a directive/suggestion, *what you changed*; for a question, your
*answer + reasoning* (and, if you declined a suggestion, why). Every triaged thread gets exactly one reply.

## 6. Hand off

Report, per comment: the verdict (directive/suggestion/question), what you did (change or reply), and the
gate/verify result. Confirm the push landed (`local == remote HEAD`) and that the unrelated-file/stray-commit
cleanup, if any, is reflected in `git diff origin/main --stat`. **Stop there — do not merge or enable
auto-merge.** The reviewer re-reviews; the merge is theirs.

## 7. Retro — improve the skill

Before ending the session, check this run against step 2's classification: did any comment get
misclassified — a question you treated as a directive (unwanted churn), a directive you softened into a
suggestion, a "suggestion" that was actually load-bearing? Did the reviewer come back with a follow-up
that a sharper first read would have caught? Since this skill runs cold every time (no memory of prior
runs), a misclassification pattern that isn't written down here will just recur on the next PR.

If something generalizes, edit this SKILL.md now — add the concrete failure mode to step 2's guidance
(the "mis-reading a question as a mandate" line started this way) rather than a vague reminder to "be
careful." Skip this step if every comment landed as classified on the first pass.
