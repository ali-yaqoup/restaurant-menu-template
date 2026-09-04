#!/usr/bin/env bash
set -euo pipefail
DEST="${1:-}"
if [[ -z "${DEST}" || ! -d "${DEST}/src" ]]; then
  echo "Usage: ./tools/add-to-portfolio/apply.sh /path/to/Ali-Portfolio" >&2
  exit 1
fi
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "${DEST}/public/projects" "${DEST}/public/demos"
cp "${ROOT}/public/projects/taste-menu.jpg" "${DEST}/public/projects/taste-menu.jpg"
rm -rf "${DEST}/public/demos/restaurant-menu"
cp -a "${ROOT}/public/demos/restaurant-menu" "${DEST}/public/demos/restaurant-menu"
python3 - "${ROOT}/taste-menu-project.json" "${DEST}/src/projects.json" <<'PY'
import json, sys
from pathlib import Path
entry = json.loads(Path(sys.argv[1]).read_text())
dest = Path(sys.argv[2])
projects = json.loads(dest.read_text())
projects = [p for p in projects if p.get("id") != entry["id"]]
projects.insert(0, entry)
dest.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + "\n")
print("inserted", entry["title"], "into", dest)
PY
echo "Done. In Ali-Portfolio run: git add -A && git commit -m 'feat: add Taste luxury digital menu' && git push origin main"
