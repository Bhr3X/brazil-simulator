#!/usr/bin/env bash
# ==============================================================================
# Studio MKT — itch.io Deployment Pipeline (Butler CLI)
# ==============================================================================
set -euo pipefail

BUTLER="${BUTLER:-/Users/bhreno/bin/butler}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLES_DIR="${SCRIPT_DIR}/bundles"
DEFAULT_USER="gamemd"

# Terminal formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err() { echo -e "${RED}[ERROR]${NC} $1"; }

check_butler() {
  if [ ! -x "$BUTLER" ]; then
    log_err "Butler binary not found or not executable at: $BUTLER"
    exit 1
  fi
}

cmd_validate() {
  check_butler
  log_info "Validating all game bundles in: $BUNDLES_DIR"
  echo "--------------------------------------------------------"
  for zipfile in "$BUNDLES_DIR"/*.zip; do
    if [ -f "$zipfile" ]; then
      "$BUTLER" file "$zipfile"
    fi
  done
  echo "--------------------------------------------------------"
  log_success "All archives validated successfully."
}

cmd_login() {
  check_butler
  log_info "Launching Butler authentication in browser..."
  "$BUTLER" login
}

cmd_status() {
  check_butler
  local user="${1:-$DEFAULT_USER}"
  log_info "Checking channel status for account: $user"
  
  GAMES=("game-md" "brazil-simulator" "rogue-chronicles" "vegan-t-rex" "mythocondria" "1894-airstrip-one")
  for game in "${GAMES[@]}"; do
    echo ""
    log_info "Target: $user/$game"
    "$BUTLER" status "$user/$game" || log_warn "Could not fetch status for $user/$game (page may not exist yet)."
  done
}

cmd_push() {
  check_butler
  local user="${1:-$DEFAULT_USER}"
  local target_game="${2:-all}"

  declare -A GAME_FILES=(
    ["game-md"]="game-md.zip"
    ["brazil-simulator"]="brazil-simulator.zip"
    ["rogue-chronicles"]="rogue-reborn.zip"
    ["rogue-reborn"]="rogue-reborn.zip"
    ["vegan-t-rex"]="vegan-t-rex.zip"
    ["mythocondria"]="mythocondria.zip"
    ["1894-airstrip-one"]="1894.zip"
  )

  push_single() {
    local slug="$1"
    local file="${GAME_FILES[$slug]:-}"
    if [ -z "$file" ]; then
      log_err "Unknown game slug: $slug"
      return 1
    fi

    local bundle_path="$BUNDLES_DIR/$file"
    if [ ! -f "$bundle_path" ]; then
      log_err "Bundle file not found: $bundle_path"
      return 1
    fi

    local target="$user/$slug:html5"
    log_info "Pushing $bundle_path to itch.io target: $target"
    "$BUTLER" push "$bundle_path" "$target"
    log_success "Successfully deployed $slug to $target"
  }

  if [ "$target_game" = "all" ]; then
    log_info "Starting batch deployment to itch.io account: $user"
    for slug in "game-md" "brazil-simulator" "rogue-reborn" "vegan-t-rex" "mythocondria" "1894-airstrip-one"; do
      echo ""
      push_single "$slug" || log_warn "Deployment of $slug encountered issues."
    done
  else
    push_single "$target_game"
  fi
}

show_help() {
  echo "Studio MKT — itch.io Deployment CLI"
  echo ""
  echo "Usage: ./deploy.sh [command] [args]"
  echo ""
  echo "Commands:"
  echo "  validate             Inspect and validate all bundles using Butler"
  echo "  login                Authenticate Butler via browser"
  echo "  status [user]        Check status of all games for given account (default: gamemd)"
  echo "  push [user] [slug]   Push bundle to itch.io (slug='all' or specific game)"
  echo ""
  echo "Examples:"
  echo "  ./deploy.sh validate"
  echo "  ./deploy.sh login"
  echo "  ./deploy.sh push gamemd brazil-simulator"
  echo "  ./deploy.sh push gamemd all"
}

# Entrypoint routing
ACTION="${1:-help}"
shift || true

case "$ACTION" in
  validate) cmd_validate ;;
  login) cmd_login ;;
  status) cmd_status "$@" ;;
  push) cmd_push "$@" ;;
  help|*) show_help ;;
esac
