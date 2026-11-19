# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/NoviliaRahmawati/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/NoviliaRahmawati/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline guide and tracker for all 55 PS5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze). Every trophy keeps PlayStation's official name, description and grade verbatim, beside a guide written in our own words from launch-day research: concrete locations, counts and steps, each with 3–6 named sources (PowerPyx, gta.guide, games.gg, gamemapa, Leonida Interactive, GamesHorizon, plus the official Exophase/PSNProfiles lists). Where a trigger is still unconfirmed, the guide says so instead of guessing.

What's inside:

- **Stage-grouped checklist** — the 55 trophies organised into a 9-stage platinum roadmap (Chapters 1–5, then free-roam cleanup), with search, kind/grade filters with counts, a P/G/S/B progress breakdown, and per-trophy PSN counters that auto-mark a trophy earned at target.
- **Missables done honestly** — PowerPyx flags exactly one potentially missable trophy: *Positive Mental Attitude*, because Lucia's Chapter 1 balcony meditation (the morning after *Down to Earth*) disappears when Chapter 1 ends. The app shows a red warning with the exact window, why it matters and the safe play, plus a cited "what cannot be missed" watchlist (expiring optional missions, fences, Kenton's quiet stretch, the Irredeemable profile, cheats).
- **Spoiler shield** — the 28 trophies PlayStation hides stay masked (name, description and guide) until you mark them earned; a header toggle shows how many are hidden.
- **Guide pane** — numbered steps, roadmap context, confidence labels, visible named sources, personal notes and an earn toggle.
- **Roadmap, Missables, Next-up planner and Save & Settings pages** — progress persists in localStorage and exports/imports as a JSON file.

The app is plain static ES modules with no build step and no runtime network: every file it loads lives under `app/`, and source links open only if you follow them. No Rockstar artwork — the look is original.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080 (Node 22.18+)
```

Hand-in (what the grader runs): `MAKEFUN_OUTPUT_DIR=out node main.ts` copies `app/` and `screenshots/` and writes `dossier.json` via the kit's vendored library. Headless checks: `node scripts/exercise.mjs`; screenshots: `node scripts/shoot.mjs` (both expect `serve.ts` on :8080).

---

<sub>Entered on [make.fun](https://make.fun/?ref=1pm982b1&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
