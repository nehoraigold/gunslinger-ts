---
name: open-pr
description: >-
  Use to turn a completed, verified change into a pull request against main —
  branch hygiene, this repo's commit/PR conventions, and a structured PR body
  with verification evidence. Opens the PR for human review; never merges. Invoked
  at the end of develop-feature, or directly when a change is ready to ship.
---

# Opening a pull request

Takes a finished, **already-verified** change and opens a PR against `main` for the user to review.
This skill owns *git/GitHub hygiene and PR authoring* — not code changes and not the decision that the
work is done. **It never merges; the human reviews and merges.**

**Preconditions — do not open a PR until all hold:**
- The change is complete and the pre-commit gate passes (`typecheck` + `test` + `lint`). If you
  haven't already, this is the moment they must be green — the husky hook will block the commit otherwise.
- Runtime behavior was observed (via `/verify`) where the change has a runtime surface — you'll paste
  that evidence into the PR body.
- The user has approved the work (in `develop-feature`, that's the Gate-1 spec + Gate-2 design; for a
  direct invocation, confirm they want a PR before opening outward-facing anything).

## 1. Check the ground

```bash
git status --short          # something to commit?
git rev-parse --abbrev-ref HEAD
git remote -v               # PRs go to origin (github.com/…/gunslinger-ts), base = main
gh auth status              # must be logged in
```

- **`gh` not authenticated?** It's interactive — ask the user to run `! gh auth login` in the session
  (the `!` prefix runs it here so output lands in the conversation). Don't try to script the login.
- **Nothing to commit and no unpushed branch?** Stop — there's nothing to open.
- **Separate *this feature's* files from unrelated changes before staging.** `git status --short` often
  shows files that predate your work or belong to another concern (a stray `.claude/settings.json`, an
  editor config, a scratch file). **Don't `git add -A`.** Stage the feature's file set explicitly (e.g.
  `git add src/`, or name the paths), then re-check `git status --short` — anything still listed as
  untracked/modified is out of scope. If you're unsure whether a file belongs, ask rather than sweep it
  in. (A `gh pr create` "N uncommitted changes" warning is the expected, harmless signal that you
  correctly left something out — not a problem to fix.)

## 2. Branch (never commit to `main`)

If `HEAD` is `main`, create a feature branch first — `git switch -c <type>/<slug>` (e.g.
`feat/time-passing`, `fix/unlock-key-consumed`). If already on a suitable feature branch, use it.
Match the branch name to the change; keep it short and kebab-cased.

## 3. Commit

- **Message:** imperative subject (≤ ~70 chars), then a body explaining *why*, not what. Group logically;
  if the branch already has good commits, don't re-commit — just ensure the tip is clean.
- **Append this session's trailers** exactly as the harness specifies them for the current session —
  the `Co-Authored-By:` line (current model) and the `Claude-Session:` line. Don't invent or hardcode a
  session id from another run; use what this session was given.
- **The husky pre-commit hook runs lint-staged + typecheck + test.** If it fails, *fix the cause* — never
  bypass with `--no-verify`. A blocked commit means the work isn't actually done.

## 4. Push & open the PR

```bash
git push -u origin <branch>
gh pr create --base main --title "<subject>" --body "$(cat <<'EOF'
…body…
EOF
)"
```

**Seed the body from the artifacts, not from memory.** If `develop-feature` wrote a scratch spec (Phase 0)
and a plan file (Phase 1/Gate 2), **read those files back** and lift the Spec and Design sections from them
verbatim — the PR must reflect what the user *approved*, and reconstructing it from memory lets it drift.
Same for the `/verify` transcript: paste the actual observed output, don't paraphrase it.

**PR body structure** (this is the reviewer's whole context — make it complete):

- **Summary** — what changes and why, a few sentences.
- **Spec** — the approved functional spec (link or inline). What the player experiences; the non-goals.
- **Design** — the approved architecture: what state/types changed, where the logic lives, key
  decisions and the alternative not taken.
- **Test plan** — the `describe`/`it` cases added and what they cover.
- **Verification** — the `/verify` evidence: the observed runtime behavior (paste the transcript /
  attach the screenshot). This is what tells the reviewer it actually runs.
- **For reviewer attention** — anything you're unsure about, deliberately deferred, or want a second
  opinion on. Honesty here is worth more than a clean-looking PR.
- End the body with the PR-body trailer the harness specifies (`🤖 Generated with Claude Code` + the
  session link).

## 5. Hand off

Report the PR URL and a one-line summary. **Stop there — do not merge, do not enable auto-merge.** The
PR is the deliverable; the review is the user's.
