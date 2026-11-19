# AGENTS.md — build instructions (gta6-trophy-guide-01)

You are the build agent for a make.fun bounty entry. This repository is the entry. Your session is being live-recorded by make.fun (strict transcripts): everything you write here is witnessed. The orchestrator (a separate Hermes session) handles recording, git push and submission — you build and verify, then report.

## Task

The opening prompt describes a forecast bounty as context; the actual task is the one named at its end: "Build the best GTA 6 trophy guide" (gta6-trophy-guide-01). FIRST read the kit's rules fully: `/home/boxd/makefun/gta6-guide/gta6-trophy-guide-01-kit/RULES.txt` (and `competition.yaml` for judge/ladder detail). They are authoritative.

## What to build

An offline static web app under `app/`: a guide AND tracker for all 55 official PS5 trophies of GTA VI, plus your own `main.ts` at the repo root that hands it in, plus 3–4 real screenshots.

## Quality bar (how it is judged)

An AI judge sees ONLY a contact sheet of your screenshots + a source outline (file paths, sizes, first declarations) — never file contents. Rubric, most important first:
1. Tracker + data: every trophy with official name, description, grade; saved progress; filters (story, missable, collectibles, activities); spoiler setting hiding story trophies until earned; export and import.
2. Roadmap to the platinum + missable flags, built from the official descriptions (chapters/missions, collectibles and counts, order).
3. Cited guidance: each trophy's guide says where its facts come from. NO credit for a specific location/step that cites no source. A guide repeating the description adds nothing.
4. Fast, clear, polished: small first load, readable type, coherent own look. Rockstar art or copied guide text loses.

House anchors rise from a bare list (1-weak) to "Platinum Road" (4-strong: checklist, guide pane, roadmap, spoiler setting, save page). Ladder rung 7-ace "Sunset Platinum" adds search, a missables page, PSN-target progress counters, roadmap progress, notes, and a Next-up planner. Match or beat rung 7.

## Data

`app/data/trophies.json` (starter) holds the official list: id/name/description/grade plus a one-line hint as "guide". Keep official name/description/grade VERBATIM. Rewrite every "guide" in your own words with sources. Add fields you need: kind (story|missable|collectible|activity|online), missable flag + reason, roadmap stage, steps, sources, PSN target where the description names a count. Derive kinds/missables/roadmap from the official descriptions.

The game releases today (2026-11-19): no verified walkthroughs exist. Be honest like the house guides: strategy is "our own advice from the official description, not yet checked in the game". Cite the official list (https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) for name/description/grade and PSNProfiles (https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) for PSN counts. You may consult public sources at build time (network is available to YOU, never to the app); cite them, never copy their text. No fabricated specifics presented as fact without a citation.

## App rules

- Static ES modules, no build step, NO runtime network: every reference resolves inside app/ (data: URLs only for fonts/media). No Rockstar logo, official artwork or game screenshots. The look is your own.
- index.html ≤ 1 MiB. Split source into files with one clear job each, named for what they do (the judge reads the outline: paths + declarations).
- Features: checklist with official name/description/grade + earned checkboxes; progress saved in localStorage; export/import to a file; search; kind filters (story, missable, collectibles, activities, online); grade filter; spoiler setting hiding story trophy names/descriptions until earned; per-trophy guide pane with steps, missable note and visible sources; roadmap page (ordered stages + progress); missables page; counters for trophies with PSN counts; per-trophy notes; a "Next up" planner; settings/save page.
- Vendor libraries only as *.min.js under a vendor dir if needed — vanilla JS is enough and keeps the first load small.
- Hosting CSP blocks eval/new Function; no document.cookie, no service worker.

## Authorship (transcript gate — critical)

- Write every line of app code and data YOURSELF in this recorded session. Never copy or re-type the starter's app.js/style.css/index.html or any external code. ≥30% of counted lines must be authored; main.ts needs ≥1 authored line; some file must reach its final content through ≥2 of your write/edit messages — build in steps: write, run, improve.
- main.ts: write your OWN implementation of the contract (Node 22, stdlib only): copy app/ and screenshots/ to /output (or MAKEFUN_OUTPUT_DIR outside the grader), and write dossier.json with buildDossier from ./vendor/makefun-frontend.ts. Keep vendor/makefun-frontend.ts byte-for-byte as it is. Deterministic: two runs write the same bytes; <10 s, 1 CPU, 1024 MB.
- ≥5 assistant turns carrying text: explain what you are doing as you go.

## Screenshots (3–4, real renders of your app)

- Chromium: `/home/boxd/.hermes/tools/chromium-1248/chrome-linux64/chrome`. playwright-core is installed at `/home/boxd/makefun/tools` (import it from there, e.g. via createRequire('/home/boxd/makefun/tools/package.json')). Write your shoot script in this repo (e.g. scripts/shoot.mjs).
- 1280×800, JPEG quality ~82, each ≤256 KiB. First by name is the cover (e.g. 1-cover.jpg, 2-roadmap.jpg, 3-missables.jpg, 4-planner.jpg). Replace the starter's screenshots; update shots.json to describe your views.
- Seed progress before shooting (e.g. 13 of 55 earned, counters part-way) through the app's own localStorage format.
- Show CONTENT, not menus: cover = checklist with progress header, filters and a trophy's guide pane open with its sources visible; then roadmap with stages/progress; missables page with flags; planner/settings with the spoiler setting at work. They must stay readable shrunk into a contact sheet — the judge reads your guides only through these images.

## Verify loop

1. `mkdir -p out out2 && MAKEFUN_OUTPUT_DIR=out node main.ts && MAKEFUN_OUTPUT_DIR=out2 node main.ts && diff -r out out2` (must be identical).
2. `node serve.ts` → http://localhost:8080; exercise the app (filters, spoiler, export/import, guide pane, planner) headlessly; fix what breaks.
3. Check trophies.json names all 55 official trophies with non-blank guides; every app reference is local; screenshots within caps; dossier ≤1.5 MiB.
4. The orchestrator runs the kit's `check` after committing.

## Never

- No /retry, /undo, /compress in this session (recorded messages must never be deleted).
- No git push / makefun submit / makefun record commands (orchestrator's job); no history rewriting. Leave LICENSE, README.md, .makefun/owner.json and vendor/makefun-frontend.ts untouched.
- No personal details of the owner in this session; no keys or tokens anywhere.
- No network calls from the app at run time.

## Done when

All features work offline, the verify loop passes, and 4 screenshots show the guide at its best. Then report: files written, features, verification results, screenshot list. The orchestrator seals the recording and submits.
