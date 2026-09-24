#!/usr/bin/env sh
set -eu
PORT="${1:-8080}"
cd "$(dirname "$0")/../catalogs"
python3 -m http.server "$PORT"
