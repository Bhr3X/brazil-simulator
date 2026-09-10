#!/usr/bin/env bash
# ==============================================================================
# Studio MKT — Bundle Packaging Script
# Regenerates and packages all 6 HTML5 distribution bundles
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLES_DIR="${SCRIPT_DIR}/bundles"
mkdir -p "$BUNDLES_DIR"

echo "==> Packaging 1: game.md"
if [ -f "/Users/bhreno/code/game.md/submission-packs/v1.11.2-itch/game-md-v1.11.2-html5.zip" ]; then
  cp "/Users/bhreno/code/game.md/submission-packs/v1.11.2-itch/game-md-v1.11.2-html5.zip" "$BUNDLES_DIR/game-md.zip"
  echo "    Packaged game-md.zip"
fi

echo "==> Packaging 2: Brazil Simulator"
cd "/Users/bhreno/First Person Engine"
node build.js
rm -rf /tmp/brazil_bundle && mkdir -p /tmp/brazil_bundle
cp "/Users/bhreno/First Person Engine/pirituba_standalone.html" /tmp/brazil_bundle/index.html
cd /tmp/brazil_bundle && zip -q -9 "$BUNDLES_DIR/brazil-simulator.zip" index.html
rm -rf /tmp/brazil_bundle
echo "    Packaged brazil-simulator.zip"

echo "==> Packaging 3: Rogue Reborn"
if [ -f "/Users/bhreno/Desktop/Rogue Reborn - v0.3.0 CrazyGames/GAME_UPLOAD.zip" ]; then
  cp "/Users/bhreno/Desktop/Rogue Reborn - v0.3.0 CrazyGames/GAME_UPLOAD.zip" "$BUNDLES_DIR/rogue-reborn.zip"
  echo "    Packaged rogue-reborn.zip"
fi

echo "==> Packaging 4: Vegan T-Rex"
if [ -f "/Users/bhreno/code/Vegan T-Rex/game/releases/Vegan-T-Rex-CrazyGames-Update-05.zip" ]; then
  cp "/Users/bhreno/code/Vegan T-Rex/game/releases/Vegan-T-Rex-CrazyGames-Update-05.zip" "$BUNDLES_DIR/vegan-t-rex.zip"
  echo "    Packaged vegan-t-rex.zip"
fi

echo "==> Packaging 5: Mythocondria"
cd "/Users/bhreno/code/Mythocondria"
npm run build
cd dist && zip -q -9 -r "$BUNDLES_DIR/mythocondria.zip" .
echo "    Packaged mythocondria.zip"

echo "==> Packaging 6: 1894"
cd "/Users/bhreno/code/1894"
zip -q -9 -r "$BUNDLES_DIR/1894.zip" index.html style.css *.js
echo "    Packaged 1894.zip"

echo "==> All packages refreshed in $BUNDLES_DIR"
