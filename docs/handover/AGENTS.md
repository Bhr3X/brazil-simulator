# AGENTS.md — One Local Day

This file is the authority for agents working in this repository. Read it before anything else.
Drafted 2026-09-10 in the prototype repo (`First Person Engine/docs/handover/AGENTS.md`). Copy it to
the root of the new `one-local-day` repository as `AGENTS.md`.

## 1. What this is

A 15-minute browser life-sim. The player picks a real location on a map, becomes someone local,
improvises under pressure, and hears the neighborhood react on the radio. The world, the identity,
the situations and the radio are generated per run, validated by code, and resolved by a
deterministic simulation. Near text-free: outcomes are sound, meters, hands, motion and voice.

It grows out of the prototype "Brazil Simulator // Sobrevivência BR" (Pirituba, São Paulo), which
keeps shipping as v1 on itch.io and is not modified by this work.

## 2. Sources of truth, in order

1. This file.
2. `docs/specs/one-local-day-platform-design.md` — the v2 design spec: decisions, repo shape,
   system map, visual strategy, generation rules, milestones, invariants.
3. `docs/atlas/index.html` — the architecture atlas: 18 system contracts, seed model, entry gate,
   failure paths, cost model. Open in a browser.
4. The prototype at `/Users/bhreno/First Person Engine` — read-only reference. Its `INVARIANTS.md`
   I1–I13 are the ancestors of section 5 below.

If two sources disagree, the higher one wins. Record the disagreement in `docs/decisions/`.

## 3. Architecture in one screen

```
apps/web              place picker, shell, HUD, feedback table
packages/runtime      fixed tick loop, chunk streamer, NPC sim, vehicles, render loop
packages/render       procedural materials, parametric characters, GPU post-process stack
packages/world        PlaceSpec, GeoPack, kit prefabs, chunk formats, compiler client
packages/rules        rng streams, clock, state, journal, classes, director, quests   <- the core
packages/audio        synth beds, SFX, spatial, procedural music, newsroom client
packages/input        intents from keyboard, mouse, touch, gamepad, pointer lock, vehicle seats
services/coordinator  job graph, deadlines, epochs, cancellation, cost caps
services/geo          roads, footprints, elevation, POIs, coverage gate, provenance
services/authors      context, identity + quest, encounter + item, wardrobe parameters (LLM)
services/compiler     world-law validation, chunk assembly, scenario manifests
services/newsroom     journal facts -> checked script -> TTS segments (LLM + TTS)
```

Dependency rule: `rules` depends on nothing. `runtime` depends on `rules`, `world`, `render`,
`input`, `audio`. `apps/web` may depend on everything. Services depend only on `rules` and `world`
schemas. Nothing imports upward. Nothing imports `apps/web`.

The loop: input -> intent -> state gate -> atomic transaction -> journal event -> director scoring,
quest and NPC updates, radio -> feedback row (sound, meter, animation, voice) -> player.

## 4. Non-negotiable decisions

| Decision | Value |
|---|---|
| Platform | Browser only. Desktop and mobile, portrait and landscape are both full play modes. Gamepad supported. |
| Simulation | Fixed tick, authoritative in the browser for the solo run. Backend output is data. It never mutates live meters. |
| Generation | Runtime, per run, hybrid. Every generated thing has a validated fallback. No interaction ever waits on a model. |
| Visuals | No produced art assets. Procedural geometry, textures and characters, plus a GPU post-process stack. |
| Text | Near text-free. Prose only in the place picker, HUD labels, and accessibility captions. |
| Determinism | Named RNG streams. Place, scenario, attempt seed layers. Async content admitted only at safe ticks and pinned in the manifest. |
| Prototype | Read-only reference. Do not edit, commit, or deploy it from this repo. |

## 5. Invariants

Hard lines. A change that breaks one is rejected in review regardless of tests.

- I1 Single mutation path. All state change goes through `apply` and emits a journal event.
- I2 Named RNG streams. `Math.random` is banned outside cosmetics. Lint enforces it.
- I3 Forward-only clock, one pause owner, 900 active seconds equal 24 game hours.
- I4 Integer minor-unit currency. Clamped integer meters in 0 to 100.
- I5 Every gameplay outcome has a feedback row. No prose is rendered for outcomes.
- I6 No `navigator`, `window.inner*`, or user-agent sniffing outside `packages/input` and the layout module.
- I7 Audio context initializes only on a user gesture.
- I8 Model output is data validated by the compiler against closed enums. Never code, never new engine powers.
- I9 The entry gate is an AND: character confirmed, safe spawn, collision and navigation ready, reachable income and recovery, one solvable goal, opening encounters, essential UI. Nothing else blocks entry.
- I10 Dependency rule of section 3. `rules` imports nothing.
- I11 Same seed and same inputs give the same journal. A determinism test runs in CI.

## 6. Agent hierarchy and routing

Three vendors are available: Claude (Cursor and Claude Code), OpenAI (Codex), Gemini (Antigravity
CLI with a large quota). Route by role, not by vendor loyalty.

| Role | Default model | Escalation | Notes |
|---|---|---|---|
| Orchestrator, planner | Claude Opus 5 or GPT-5.6 Sol | none | writes task files, owns the plan, never types bulk code |
| Execution workers | Gemini 3.8 Flash, thinking high, via Antigravity CLI | Claude Sonnet 5 or GPT-5.6 Terra after two failed attempts | one task, one package, tests as acceptance |
| Volume helpers | Gemini 3.8 Flash | none | moves, renames, scaffolds, docs, log triage |
| Reviewer | a different vendor than the author of the diff | none | checks section 5 first, then the task's acceptance |
| QA gate of record | Claude Fable 5.1 via `claude -p --model claude-fable-5-1` | none | signs off a milestone, not a task |

Rules that save more than any model choice:

- Never let a volume helper write into `packages/rules`.
- Never let a worker change an invariant. Invariant changes are a decision record plus orchestrator approval.
- Two strikes then escalate. Attach both failed diffs and the test output to the escalated task.
- One task touches one package. If it cannot, split it.
- Every worker runs in its own git worktree. Merges go through review.
- A passing test is not evidence of quality. Reviews state what was observed and how.

## 7. Task file format

One file per task in `tasks/<milestone>/<nn>-<slug>.md`:

```
# <title>
Package: packages/rules
Depends on: <task ids or none>
Goal: <one paragraph, what exists when done>
Acceptance: <exact test command and what must pass>
Do not: <files or packages this task must not touch>
Context: <paths to read first, max five>
```

Workers read the task, this file, and the listed context. Nothing else unless the task says so.

## 8. Milestones and the gate

| Milestone | Deliverable | Evidence |
|---|---|---|
| M0 | Monorepo. `packages/rules` extracted from the prototype with unit tests. Determinism test. | tests green, journal identical across two runs of the same seed |
| M1 | `packages/runtime`: fixed tick, chunk streamer, director, NPC sim, procedural renderer with the post stack, portrait and landscape, gamepad. One authored place, Pirituba as data. No backend. | 15-minute walk log: time and distance between opportunities, reserve underruns, repeats. Frame time on a mid-range Android. |
| M2 | coordinator, compiler, authors, newsroom. Manifests, fallbacks, cost caps. | opening journey P50 and P95 warm and cold, cost per run, fallback drills |
| M3 | geo service, place picker, coverage gate, vehicles, three places in two countries | M1 log on driving routes, coverage refusals |
| M4 | worldwide eligibility, generated imagery and music as async upgrades | cache hit rate, bytes per run, cost at scale |

M1 is the go or no-go for the platform. Do not start M2 until M1's log shows an interesting
authored day. Generation does not fix a boring simulation.

## 9. Working agreement

- Built, committed, pushed, deployed, published are five states. Every report says which happened.
- Assess before building. Say what was found before proposing.
- Batch questions into one message, early, then go.
- Reports are short lines and tables. Link a file or folder, do not describe a path in prose.
- Defaults in the spec may be bent with a written reason. Invariants may not.
- Read-only inspection of the prototype is always allowed. Edits to it are never part of a task here.

## 10. Commands

```
pnpm install
pnpm -r test              # unit tests, all packages
pnpm -r lint              # includes the Math.random ban
pnpm --filter web dev     # apps/web on a local port
pnpm e2e                  # Playwright, viewport matrix: desktop, phone portrait, phone landscape
pnpm determinism          # runs two seeded attempts and diffs the journals
```

Until the monorepo exists, the prototype's reference commands are `python3 -m http.server 8090`
and `node tests/qa_cdp.mjs` in `/Users/bhreno/First Person Engine`.
