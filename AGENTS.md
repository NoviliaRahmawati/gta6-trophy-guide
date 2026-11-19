# AGENTS.md — build contract for gta6-trophy-guide-01 (improvement session #2)

This repo is a make.fun bounty entry. This file is the working contract for the agent sessions recorded here. make.fun witnesses every message and file write under strict transcript rules; a separate orchestrator session owns the recording seal, git push and submission. The build sessions build, verify and report — they never submit.

## Task 0 — docs are authored in-session, first

The recording only credits documents it watched being written. Before any other work: (1) this AGENTS.md is rewritten by the agent in its own words — every rule and path from the previous contract survives below; (2) README.md is written fresh from the template at the bottom of this file, badges byte-for-byte, description in the agent's own words. Both files must end up authored in a recorded session.

Two-recording setup: the entry bundles the sealed first-build recording (session #1, which built the original entry) and this improvement recording (session #2). The transcripts_witnessed check counts every tracked file: any counted file that keeps its recording-start content with no line written by the agent in the bundled sessions fails the entry. Session #2 therefore rewrote every tracked non-vendor file — app sources, data, scripts, plumbing, shots.json, .gitignore, README.md and this AGENTS.md — and retook all four screenshots. vendor/ is the kit's unchanged copy and is exempt; LICENSE and .makefun/owner.json stay untouched.

## The task

The opening prompt of the first session mentioned a forecast bounty as context only. The real task, named at its end, is "Build the best GTA 6 trophy guide" (competition gta6-trophy-guide-01). The authoritative rules are the kit's, read in full before building:

- `/home/boxd/makefun/gta6-guide/gta6-trophy-guide-01-kit/RULES.txt`
- `competition.yaml` in the kit for judge and ladder detail

Session #2 was an IMPROVEMENT pass on the already-submitted entry: deepen every guide with researched, cited specifics; do missables properly; group the checklist by roadmap stage; retake the screenshots so the judge's contact sheet shows the guide at its best; keep the scorer green. That work is complete and committed; the rules below remain the contract for any further recorded work.

## What to build

An offline static web app under `app/` that is both guide and tracker for all 55 official PS5 trophies of GTA VI, an original `main.ts` at the repo root that hands the app in, and 3–4 real screenshots of the running app.

## How judging works (quality bar)

The AI judge never reads file bodies. It sees only a contact sheet of the screenshots (cover fitted to 768×480 on top, the rest smaller beneath) plus a source outline (paths, sizes, first declarations). Rubric, in priority order:

1. Tracker + data: every trophy with its official name, description and grade; progress that persists; filters (story, missable, collectibles, activities); a spoiler setting that hides story trophies until earned; export and import.
2. Roadmap to the platinum and missable flags derived from the official descriptions (chapters/missions, collectibles and counts, earning order).
3. Cited guidance: every guide states where its facts come from. A specific location or step with no citation earns no credit; restating the description adds nothing.
4. Fast, clear, polished: small first load, readable type, coherent original look. Rockstar art or copied guide text loses.

The house ladder climbs from a bare list (1-weak) to "Platinum Road" (4-strong: checklist, guide pane, roadmap, spoiler setting, save page) to rung 7-ace "Sunset Platinum" (search, missables page, PSN-target counters, roadmap progress, notes, Next-up planner). This entry must match or beat rung 7 — and beat the rank-1 sheet: stage-grouped checklist, red missable warning naming the exact point of no return, 5–6 named sources per trophy, concrete where/how, visible counters and spoiler toggle.

## Data rules

`app/data/trophies.json` carries the official list from the starter: id/name/description/grade/hidden. The official name, description and grade stay VERBATIM (one name contains asterisks: "T**s Ass Drug Money"). Every "guide" is written in the agent's own words with named sources beside it. Extra fields the app uses: kind (story|collectible|activity|online), missable flag with window/point-of-no-return/why/safe-play, roadmap stage, chapter, steps, confidence label, sources, and a PSN target wherever a count is tracked. Kinds, missables and the roadmap are derived from the official descriptions plus the cited guides.

Research policy: the game releases 2026-11-19, so launch-day guides exist but are fresh. Public sources may be consulted at build time (the agent has network; the app NEVER does). Bake every researched fact into app/data with its citation; cite only sources that support the claim; never copy their text. Where sources disagree or a trigger is unconfirmed, say so honestly in the guide ("reported, not yet verified") — honest uncertainty beats fake precision. No fabricated specifics presented as fact without a citation. Core sources: the official list via Exophase (https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) for names/descriptions/grades, PSNProfiles (https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) for PSN counts/hidden flags, PowerPyx's trophy guide & roadmap, gta.guide, games.gg, gamemapa, Leonida Interactive, GamesHorizon (UFO event), gtaculture and pro-gamer.gg (reported theories, labelled unconfirmed).

The improved data follows PowerPyx's launch-build check: exactly one potentially missable trophy — Positive Mental Attitude, because Lucia's Chapter 1 balcony meditation (the morning after Down to Earth) vanishes when Chapter 1 ends. The Missables page pairs that red warning with a cited "what cannot be missed" watchlist and labels the secret trophies whose triggers are still unknown or only reported.

## App rules

- Static ES modules, no build step, NO runtime network: every reference resolves inside app/ (data: URLs only for fonts/media). No Rockstar logo, official artwork or game screenshots; the look is original.
- index.html ≤ 1 MiB. Split source into files with one clear job each, named for what they do — the judge reads the outline (paths + declarations).
- Features: checklist with official name/description/grade and earned checkboxes, grouped by roadmap stage with headers; progress in localStorage; export/import to a file; search; kind filters (story, missable, collectibles, activities, online) with counts; grade filter; a prominent spoiler setting that hides the 28 PlayStation-hidden trophies (every story beat included) until earned; per-trophy guide pane with numbered steps, red missable warning (window + point of no return + why + safe play), roadmap context and visible named sources; roadmap page (nine ordered stages in two columns, live progress); missables page (windows + watchlist); PSN-target counters that auto-earn at target; per-trophy notes; Next-up planner; settings/save page with a live shield preview.
- Vendor libraries only as *.min.js under a vendor dir if needed — vanilla JS keeps the first load small.
- Hosting CSP blocks eval/new Function; no document.cookie, no service worker.

## Authorship (transcript gate — critical)

- Every line of app code and data is written by the agent in a recorded session; across the two bundled recordings every tracked non-vendor file carries at least one authored line. Never copy or re-type the starter's app code or any external code. At least 30% of counted lines must be authored; main.ts needs ≥1 authored line; some file must reach final content through ≥2 of the agent's write/edit messages — build in steps: write, run, improve.
- main.ts: original implementation of the hand-in contract (Node 22, stdlib only): copy app/ and screenshots/ to /output (or MAKEFUN_OUTPUT_DIR outside the grader) and write dossier.json with buildDossier from ./vendor/makefun-frontend.ts. vendor/makefun-frontend.ts stays byte-for-byte as it is. Deterministic: two runs write the same bytes; under 10 s, 1 CPU, 1024 MB.
- At least 5 assistant turns carry text: explain the work as it happens.

## Screenshots (3–4, real renders of the app)

- Chromium lives at `/home/boxd/.hermes/tools/chromium-1248/chrome-linux64/chrome`. playwright-core is installed at `/home/boxd/makefun/tools` (import it from there, e.g. via createRequire('/home/boxd/makefun/tools/package.json')). The shoot script is written in this repo (scripts/shoot.mjs).
- 1280×800, JPEG quality ~82, each ≤256 KiB, long side ≤1280, short side ≥480. The first file by name is the cover: 1-cover.jpg, 2-roadmap.jpg, 3-missables.jpg, 4-settings.jpg. Replace old screenshots and update shots.json to describe the views.
- Seed progress before shooting through the app's own localStorage format (the current shots use 16 of 55 earned, counters part-way, the missable still open).
- Show CONTENT, not menus, readable when shrunk into the contact sheet (bigger type, high contrast, fewer rows): cover = stage-grouped checklist (official names, grade dots, MISSABLE tags, progress header, filter pills with counts, spoiler toggle) with the guide pane open on the MISSABLE trophy showing its red warning box, counter, numbered steps and six named sources; then the full nine-stage roadmap with the Chapter 1 missable callout; the missables page with the point of no return and watchlist; settings with the spoiler shield preview at work and export/import. The judge reads the guides only through these images. Never edit or composite a shot.

## Verify loop

1. `mkdir -p out out2 && MAKEFUN_OUTPUT_DIR=out node main.ts && MAKEFUN_OUTPUT_DIR=out2 node main.ts && diff -r out out2` (must be identical).
2. `node serve.ts` → http://localhost:8080; exercise the app headlessly (scripts/exercise.mjs: filters, spoiler, export/import, guide pane, counters, planner, offline proof); fix what breaks.
3. Check that trophies.json names all 55 official trophies with non-blank guides and verbatim official fields; every app reference is local; screenshots are within caps; dossier ≤1.5 MiB. This competition grades server-side (RULES.txt "Grade locally"), so main.ts preflight mirrors the caps locally.
4. The orchestrator runs the kit's `check` after committing.

## Never

- No /retry, /undo, /compress in a recorded session (recorded messages must never be deleted).
- No git push / makefun submit / makefun record / makefun login commands (the orchestrator's job); no history rewriting. Leave LICENSE, .makefun/owner.json and vendor/makefun-frontend.ts untouched. README.md and AGENTS.md are authored in-session per Task 0, then left alone.
- No personal details of the owner in a recorded session; no keys or tokens anywhere.
- No network calls from the app at run time.

## Done when

All features work offline, the verify loop passes, every tracked non-vendor file carries an authored line from the bundled recordings, and 4 screenshots show the improved guide at its best. Then report: files written, features, verification results, screenshot list. The orchestrator seals the recording, commits, bundles both recordings and submits (Force_Last replaces the entry).

## README.md template (write it yourself; badges verbatim, no placeholders left)

```markdown
# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/NoviliaRahmawati/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/NoviliaRahmawati/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

<your own description of the guide and tracker>

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080 (Node 22.18+)
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=1pm982b1&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
```
