# One Local Day — Platform Design Spec (v2)

Date: 2026-09-10
Status: DRAFT for approval. Supersedes `2026-09-10-place-engine-design.md`.
Companion: `docs/atlas/index.html` (Codex architecture atlas, 18 system contracts, recovered 2026-09-10).

## 1. Settled decisions

| Decision | Value | Source |
|---|---|---|
| Platform | Browser only. Desktop and mobile, portrait and landscape both full play modes. Gamepad. | user |
| Generation | Runtime, per run, hybrid: cached regional material plus fresh per-run writing, voice and optionally music. Backend services exist. | user, atlas |
| Visuals | No produced art assets. Procedural geometry, procedural textures, procedural characters, GPU post-process stylization. Best effect achievable that way. | user |
| Text | Near text-free. Gameplay outcomes are sound, meters, hands, motion and voice. Text stays in place picker, HUD labels and accessibility captions. | user |
| Strategy | Transplant. New platform repo. Prototype's rules, audio and input move over as packages. World, renderer scene graph, traffic and dialogs are left behind. Prototype keeps shipping as v1. | this spec |
| Determinism | Named RNG streams. Place, scenario, attempt seed layers as in the atlas. Async content admitted only at safe ticks. | atlas |
| Simulation | Fixed tick, authoritative in the browser for the solo run. Backend authors never mutate live meters. | atlas |

## 2. Non-goals

- Reconstructing Street View imagery. Rights-gated. Playable approximation from licensed roads, footprints and elevation instead.
- Bespoke 3D meshes, rigs or textures made by artists or generated on the critical path.
- Multiplayer authority.
- Bit-exact physics replay across devices. Snapshots plus event replay only.

## 3. Repository shape

```
one-local-day/
  packages/rules      rng streams, clock, state, journal, classes, director, quests      (transplant + new)
  packages/audio      synth beds, SFX, spatial, procedural music, newsroom client        (transplant)
  packages/input      intents: keyboard, mouse, touch, gamepad, pointer lock, vehicles   (transplant + new)
  packages/world      PlaceSpec, GeoPack, kits, compiler client, chunk formats           (new)
  packages/runtime    fixed tick loop, chunk streamer, NPC sim, vehicles, renderer       (new)
  packages/render     procedural materials, characters, post-process stack              (transplant Textures + ASCII, new)
  services/coordinator  job graph, deadlines, epochs, cancellation                      (new)
  services/geo          resolver: roads, footprints, elevation, POIs, coverage gate     (new)
  services/authors      context, identity+quest, encounter+item, wardrobe params        (new, LLM)
  services/compiler     world-law validation, chunk assembly, manifests                 (new)
  services/newsroom     journal facts to checked script to TTS segments                 (new, LLM+TTS)
  apps/web              place picker, shell, HUD, feedback table                        (new)
```

Dependency rule: `rules` depends on nothing. `runtime` depends on `rules`, `world`, `render`, `input`, `audio`. `apps/web` depends on everything. Services depend on `rules` and `world` schemas only.

## 4. System map against the atlas

| Atlas contract | Package or service | Origin |
|---|---|---|
| Place picker | apps/web | new |
| Run coordinator | services/coordinator | new |
| Geography resolver | services/geo | new |
| Context researcher | services/authors | new |
| Wardrobe author | services/authors emits parameters; packages/render builds the body | new, no meshes |
| Identity and quest author | services/authors | new |
| Encounter and item author | services/authors | new |
| World-law compiler | services/compiler | new |
| Chunk streamer | packages/runtime | new |
| Renderer and cameras | packages/render, packages/runtime | Renderer ASCII pass and Textures transplanted, rest new |
| Input and vehicles | packages/input, packages/runtime | Controls and TouchControls transplanted, vehicles new |
| State and world rules | packages/rules | GameState, RunClock, Classes, DayCycle transplanted |
| NPC and traffic simulation | packages/runtime | new, prototype NPC follow logic as reference |
| Pacing director | packages/rules | new |
| Event journal | packages/rules | GameState history extended |
| Radio newsroom | services/newsroom, packages/audio | NewsDesk loop transplanted as the client |
| Audio mixer | packages/audio | SoundEngine, BrazilianMusic, SpatialSound transplanted |

## 5. Visual strategy without assets

The prototype already proves the approach. The plan makes it the identity rather than a fallback.

| Layer | Approach | Source |
|---|---|---|
| Geometry | Kit prefabs from primitives. Footprints from GeoPack extruded with a facade grammar: floors, windows, doors, balconies, signage slots, roof types. | CityBuilder patterns, rewritten as prefabs |
| Textures | Procedural canvas and shader materials. Atlas per kit. Place culture picks palettes. | Textures.js transplanted |
| Characters | Parametric humanoid: proportions, skin, hair, garments as shells on a shared skeleton. Procedural walk, idle, carry, drive cycles. Wardrobe author outputs parameters and palettes only. | prototype avatar as seed |
| Atmosphere | Sky gradient by hour, fog, sun and shadow, rain, wet-asphalt reflection, bloom. | DayCycle transplanted |
| Post-process stack | GPU full-screen passes: retro 3D base, ASCII, braille, dither, cel and outline, VHS, thermal. Density and depth scaling as uniforms. This is where "best effect without assets" comes from: stylization that reads as intended. | Renderer CPU loop ported to GLSL |
| Optional generated imagery | Per-place signage, posters, skybox tiles from an image model. Async, cached in the scenario manifest, never on the entry gate. | new |

Frame targets from the atlas: 16.7 ms desktop, 33.3 ms mobile. Draw calls under 50 through instancing and batching.

## 6. Text-free pass on the atlas

| Atlas item | Replacement |
|---|---|
| Authors produce dialogue and jokes | Authors produce beats, items, NPC behavior parameters, place facts, and voice scripts for radio. No on-screen dialogue. |
| Quick actions by number keys | Physical verbs: hands, doors, pickups, vehicles, gestures. |
| NPC speech | Voice barks: TTS lines or procedural vocalization, plus animation. |
| Captions | Accessibility toggle only. |
| Quest offer as text | A visible situation: an NPC approaches with an object, a vehicle appears, a radio bulletin, a meter pulse. |

The feedback contract: every committed journal event has a feedback row with sound, meter pulse, hand or body animation, icon, optional voice. `GameState.apply` emits the event; nothing renders prose for outcomes.

## 7. Generation at runtime

| Concern | Rule |
|---|---|
| Model surface | Anthropic Messages API from `services/authors` and `services/newsroom`, `claude-opus-5`, adaptive thinking, structured outputs constrained to closed enums. Provider is swappable behind one interface. |
| Never on the critical path | The entry gate needs a validated opening pack. Slow or failed generation falls back to the regional pack and deterministic templates. No interaction waits for a model. |
| Validation | Every candidate passes the world-law compiler: schema, IDs, currencies, reachability, hours, solvability, provenance. Reject or repair once, then fallback. |
| Admission | Async results are admitted at safe ticks and pinned in the scenario manifest. Gameplay never depends on provider completion order. |
| Cost | Per-run soft cap and hard cap enforced by the coordinator. Procedural music from `packages/audio` is the default bed, so fresh generated music is an upgrade, not a dependency. Web Speech is the free voice fallback. |
| Replay | Save model outputs in the manifest. Re-prompting is not replay. |

## 8. Milestones and evidence

| Milestone | Deliverable | Evidence required |
|---|---|---|
| M0 | Monorepo. `packages/rules` extracted from the prototype with unit tests. Determinism test: same seed, same journal. Prototype untouched and still live. | tests green, journal diff empty across two runs |
| M1 | `packages/runtime` with fixed tick, chunk streamer, director, NPC sim, procedural renderer with GLSL post stack, portrait and landscape, gamepad. One authored place, Pirituba as data. No backend. | 15-minute walk log: time and distance between opportunities, reserve underruns, repeats. Frame times on a mid-range Android. |
| M2 | `services/coordinator`, `compiler`, `authors`, `newsroom`. Scenario manifests. Fallbacks and cost caps. | Opening journey P50 and P95, warm and cold. Cost per run measured. Fallback drills: model down, TTS down. |
| M3 | `services/geo`, place picker, coverage gate, vehicles. Three places in two countries. | Same M1 log on driving routes. Coverage refusal paths. |
| M4 | Worldwide eligibility, generated imagery and music as async upgrades, polish. | Cache hit rates, bytes per run, cost at scale. |

M1 is the go or no-go gate for the whole platform. It reuses the most prototype code and answers the only question that matters: is an authored 15-minute day interesting without a model in the loop. If not, generation will not fix it.

## 9. Stack

| Concern | Choice |
|---|---|
| Language | TypeScript throughout. Transplanted files typed at the package boundary first. |
| Monorepo | pnpm workspaces, Vite for `apps/web`, Vitest, Playwright with a viewport matrix. |
| Rendering | Three.js from npm, WebGL2 baseline, BatchedMesh, render targets with depth for the post stack. |
| Physics | Custom fixed-tick AABB from the prototype for walking. Vehicles get a small kinematic model on the road graph, not a rigid-body engine. |
| Services runtime | Node with a job graph in the coordinator, a queue, Postgres for manifests and journals, object storage for packs. Hosting is open. |
| LLM | Anthropic SDK, structured outputs, Batches for regional pre-authoring. |
| Voice and music | Web Speech and procedural synth as defaults. Hosted TTS and music generation behind the same interfaces, budget-gated. |
| Geo data | OSM via Overpass plus licensed elevation, with a provenance record per pack. |
| Distribution | `apps/web` on static hosting, services separate. Prototype v1 stays on itch.io. |

## 10. Invariants carried into the platform

- Single mutation path: all state change goes through `apply` and emits a journal event.
- Integer minor-unit currency, clamped integer meters.
- Named RNG streams, no `Math.random` outside cosmetics, enforced by lint.
- Forward-only clock with one pause owner.
- No `navigator` or viewport sniffing outside `packages/input` and the layout module.
- Every gameplay outcome has a feedback row. No prose for outcomes.
- Backend output is data validated by the compiler. No runtime code from a model.

## 11. Open items

1. Hosting for services.
2. Whether the prototype repo receives any more features, or freezes as v1 after M0.
3. N, the longest gap without a beat, per identity. The atlas proposes 30 to 60 seconds between opportunities and a 3-minute reserve.
