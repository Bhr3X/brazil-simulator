# game.md // itch.io Publishing & Deployment Hub

A unified distribution and page management hub for our browser games portfolio on itch.io (`https://gamemd.itch.io`).

## Architecture & Layout

```
Studio MKT/
├── manifest.json              # Central metadata registry for all titles
├── copy_deck.md               # Production copy, tags, controls & embed settings
├── deploy.sh                  # Automated deployment pipeline (Butler CLI)
├── bundles/                   # Validated HTML5 distribution ZIP archives
│   ├── game-md.zip            # LLM agent platformer (344 KB)
│   ├── brazil-simulator.zip   # Pirituba 3D/ASCII survival simulation (240 KB)
│   ├── rogue-reborn.zip       # 10-minute action roguelite (20.1 MB)
│   ├── vegan-t-rex.zip        # Prehistoric 2D arcade fighter (18.0 MB)
│   ├── mythocondria.zip       # Cellular lineage dark-field simulation (142 KB)
│   └── 1894.zip               # Retro dystopian visual novel (19 KB)
├── media/                     # Covers (landscape/square/portrait), screenshots & video
│   ├── game-md/
│   ├── brazil-simulator/
│   ├── rogue-reborn/
│   └── vegan-t-rex/
└── branding/                  # Custom CSS styles for itch.io pages
    ├── studio_profile.css     # Custom theme for https://gamemd.itch.io
    └── game_page.css          # Custom theme for game embed pages
```

## Quick Start: Deployment via Butler

### 1. Authenticate Butler
Run the one-time browser login:
```bash
./deploy.sh login
```
*Or export your API token: `export BUTLER_API_KEY="your_api_key"`.*

### 2. Validate Bundles
Inspect integrity and byte counts for all staged zip archives:
```bash
./deploy.sh validate
```

### 3. Deploy to itch.io
Push individual games or all games to the `html5` channel:
```bash
# Push single game:
./deploy.sh push <itch-account> brazil-simulator

# Push all games:
./deploy.sh push <itch-account> all
```

## itch.io Page Creation Checklist

Before Butler can push a build, each project must exist on your itch dashboard:

1. Go to **Dashboard → Create new project** (https://itch.io/game/new).
2. Set **Title** and matching **URL slug** (e.g. `brazil-simulator`).
3. Set **Kind of project** to `HTML`.
4. Copy/paste the title, tagline, description, controls, and tags from `copy_deck.md`.
5. Under **Embed options**, set `1280` × `720` px, check **Fullscreen button**, and check **Mobile friendly**.
6. Upload cover images and screenshots from `media/<game-slug>/`.
7. Click **Save draft**.
8. Run `./deploy.sh push <account> <slug>` to push the build directly to the game's `html5` channel.
9. Test preview in browser, then switch visibility to **Public**.
