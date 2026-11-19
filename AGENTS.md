# AGENTS.md — build contract for gta6-trophy-guide-01

This repository is a make.fun bounty entry, and this file is the build contract for the agent working in it. The session is live-recorded by make.fun under strict transcript rules: every message and file write here is witnessed. A separate orchestrator session owns recording, git push and submission; this session builds and verifies, then reports.

## Task 0 — the repo docs must be authored here first

The recording flagged the docs that came with the starter. Before any other work: (1) rewrite this AGENTS.md in the agent's own words — every rule and path below must survive, but the final file has to be written by the agent in this session; (2) write README.md fresh from the template at the bottom of this file, badges verbatim and the description in the agent's own words. Both files must end up authored in this recorded session.

## Task

The opening prompt mentions a forecast bounty, but that is context only. The real task is the one named at its end: "Build the best GTA 6 trophy guide" (gta6-trophy-guide-01). Read the kit rules in full before building: `/home/boxd/makefun/gta6-guide/gta6-trophy-guide-01-kit/RULES.txt`, plus `competition.yaml` for judge and ladder detail. Those rules are authoritative.

## What to build

An offline static web app under `app/` that is both a guide and a tracker for all 55 official PS5 trophies of GTA VI, an original `main.ts` at the repo root that hands the app in, and 3–4 real screenshots of the running app.

## Quality bar (how judging works)

The AI judge sees only a contact sheet of the screenshots plus a source outline (file paths, sizes, first declarations) — never file contents. The rubric, in priority order:
1. Tracker + data: every trophy with its official name, description and grade; progress that persists; filters (story, missable, collectibles, activities); a spoiler setting that hides story trophies until earned; export and import.
2. A roadmap to the platinum and missable flags derived from the official descriptions (chapters/missions, collectibles and their counts, earning order).
3. Cited guidance: every trophy guide states where its facts come from. A specific location or step with no citation earns no credit. Restating the description adds nothing.
4. Fast, clear, polished: small first load, readable type, a coherent original look. Rockstar art or copied guide text loses.

The house anchors climb from a bare list (1-weak) up to "Platinum Road" (4-strong: checklist, guide pane, roadmap, spoiler setting, save page). Ladder rung 7-ace "Sunset Platinum" adds search, a missables page, PSN-target progress counters, roadmap progress, notes and a Next-up planner. This entry must match or beat rung 7.

## Data

`app/data/trophies.json` (from the starter) carries the official list: id/name/description/grade plus a one-line hint as "guide". The official name/description/grade stay VERBATIM. Every "guide" gets rewritten in the agent's own words with sources. Add whatever fields the app needs: kind (story|missable|collectible|activity|online), a missable flag with its reason, roadmap stage, steps, sources, and a PSN target wherever the description names a count. Kinds, missables and the roadmap are derived from the official descriptions.

The game releases today (2026-11-19), so no verified walkthroughs exist yet. Be honest the way the house guides are: strategy text is "our own advice from the official description, not yet checked in the game". Cite the official list (https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) for names/descriptions/grades and PSNProfiles (https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) for PSN counts. Public sources may be consulted at build time (the network is available to the agent, never to the app); cite them, never copy their text. No fabricated specifics presented as fact without a citation.

## App rules

- Static ES modules, no build step, NO runtime network: every reference resolves inside app/ (data: URLs only for fonts/media). No Rockstar logo, official artwork or game screenshots. The look is original.
- index.html ≤ 1 MiB. Split source into files with one clear job each, named for what they do (the judge reads the outline: paths + declarations).
- Features: checklist with official name/description/grade and earned checkboxes; progress saved in localStorage; export/import to a file; search; kind filters (story, missable, collectibles, activities, online); grade filter; a spoiler setting that hides story trophy names/descriptions until earned; a per-trophy guide pane with steps, missable note and visible sources; a roadmap page (ordered stages + progress); a missables page; counters for trophies with PSN counts; per-trophy notes; a "Next up" planner; a settings/save page.
- Vendor libraries only as *.min.js under a vendor dir if needed — vanilla JS is enough and keeps the first load small.
- The hosting CSP blocks eval/new Function; no document.cookie, no service worker.

## Authorship (transcript gate — critical)

- Every line of app code and data is written by the agent in this recorded session. Never copy or re-type the starter's app.js/style.css/index.html or any external code. At least 30% of counted lines must be authored; main.ts needs at least 1 authored line; some file must reach its final content through at least 2 of the agent's write/edit messages — build in steps: write, run, improve.
- main.ts: an original implementation of the contract (Node 22, stdlib only): copy app/ and screenshots/ to /output (or MAKEFUN_OUTPUT_DIR outside the grader) and write dossier.json with buildDossier from ./vendor/makefun-frontend.ts. vendor/makefun-frontend.ts stays byte-for-byte as it is. Deterministic: two runs write the same bytes; under 10 s, 1 CPU, 1024 MB.
- At least 5 assistant turns carrying text: explain the work as it happens.

## Screenshots (3–4, real renders of the app)

- Chromium lives at `/home/boxd/.hermes/tools/chromium-1248/chrome-linux64/chrome`. playwright-core is installed at `/home/boxd/makefun/tools` (import it from there, e.g. via createRequire('/home/boxd/makefun/tools/package.json')). The shoot script is written in this repo (e.g. scripts/shoot.mjs).
- 1280×800, JPEG quality ~82, each ≤256 KiB. The first file by name is the cover (e.g. 1-cover.jpg, 2-roadmap.jpg, 3-missables.jpg, 4-planner.jpg). Replace the starter's screenshots and update shots.json to describe the views.
- Seed progress before shooting (e.g. 13 of 55 earned, counters part-way) through the app's own localStorage format.
- Show CONTENT, not menus: cover = checklist with progress header, filters and a trophy's guide pane open with its sources visible; then the roadmap with stages/progress; the missables page with flags; planner/settings with the spoiler setting at work. They must stay readable shrunk into a contact sheet — the judge reads the guides only through these images.

## Verify loop

1. `mkdir -p out out2 && MAKEFUN_OUTPUT_DIR=out node main.ts && MAKEFUN_OUTPUT_DIR=out2 node main.ts && diff -r out out2` (must be identical).
2. `node serve.ts` → http://localhost:8080; exercise the app headlessly (filters, spoiler, export/import, guide pane, planner); fix what breaks.
3. Check that trophies.json names all 55 official trophies with non-blank guides; every app reference is local; screenshots are within caps; dossier ≤1.5 MiB.
4. The orchestrator runs the kit's `check` after committing.

## Never

- No /retry, /undo, /compress in this session (recorded messages must never be deleted).
- No git push / makefun submit / makefun record commands (the orchestrator's job); no history rewriting. After Task 0's authoring, leave LICENSE, README.md, .makefun/owner.json and vendor/makefun-frontend.ts untouched.
- No personal details of the owner in this session; no keys or tokens anywhere.
- No network calls from the app at run time.

## Done when

All features work offline, the verify loop passes, and 4 screenshots show the guide at its best. Then report: files written, features, verification results, screenshot list. The orchestrator seals the recording and submits.

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
