# AGENTS.md

## Brazil Simulator // Sobrevivência BR

This repository contains the full 3D/ASCII immersive simulation engine for **"Brazil Simulator // Sobrevivência BR"** (Pirituba, São Paulo, Brazil).

### Core Architecture & Invariants
- Canonical architectural constraints are strictly defined in `INVARIANTS.md` (Invariants I1 through I13).
- **Dual-Build Parity (I1)**: `index.html` (ESM modular) and `pirituba_standalone.html` (single-file distribution bundle generated via `node build.js`).
- **QA Governance**: Claude Fable 5.1 (`claude -p --model claude-fable-5-1`) is the designated architectural reviewer and QA authority.

### Automated Testing
- Automated CDP headless Chrome test suite: `node tests/qa_cdp.mjs`
  * Exercises all modal states, forward-only clock advancement, multi-owner freeze resolution, non-vacuous drag freeze protection, and footstep accumulation.
  * Asserts 0 console errors across both `index.html` and `pirituba_standalone.html`.

### Run Command
- Local dev server: `python3 -m http.server 8090`
- URLs: `http://localhost:8090/index.html` and `http://localhost:8090/pirituba_standalone.html`
