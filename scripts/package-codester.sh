#!/usr/bin/env bash
#
# Builds the ZIP uploaded to Codester.
#
# The archive contains the source tree, the offline handbook and the Codester
# license. It never contains .env files, dependencies, build output, uploads,
# developer tooling or the marketing folder.
#
# Usage:
#   scripts/package-codester.sh              # version from CHANGELOG.md
#   scripts/package-codester.sh 1.0.1        # explicit version
#
# A final release must be built from a clean tree. During preparation you can
# build a staging archive from the current working tree with:
#   ALLOW_DIRTY=1 scripts/package-codester.sh
#
# Output: dist/codester/lms-<version>-codester.zip

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

die() {
  printf '\n[FAIL] %s\n' "$1" >&2
  exit 1
}

step() {
  printf '\n==> %s\n' "$1"
}

command -v git >/dev/null 2>&1 || die "git is required."
PYTHON=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys' >/dev/null 2>&1; then
    PYTHON=$(command -v "$candidate")
    break
  fi
done
[[ -n "$PYTHON" ]] || die "python3 or python is required for ZIP verification."

# ---------------------------------------------------------------------------
# 1. Version
# ---------------------------------------------------------------------------
step "Resolving version"

if [[ $# -gt 0 ]]; then
  VERSION="$1"
else
  VERSION=$(sed -nE 's/^## \[([0-9]+\.[0-9]+\.[0-9]+)\].*/\1/p' CHANGELOG.md | head -n1)
fi

[[ -n "${VERSION:-}" ]] || die "Could not read the version. Pass it explicitly: scripts/package-codester.sh 1.0.0"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "Version '$VERSION' is not x.y.z."

printf '  version: %s\n' "$VERSION"

# ---------------------------------------------------------------------------
# 2. Codester license source
# ---------------------------------------------------------------------------
step "Checking the Codester license"

LICENSE_SOURCE="marketing/codester/LICENSE.txt"
[[ -f "$LICENSE_SOURCE" ]] || die "Missing $LICENSE_SOURCE."
grep -q 'Codester' "$LICENSE_SOURCE" || die "$LICENSE_SOURCE is not the Codester license."
grep -q 'Extended License' "$LICENSE_SOURCE" || die "$LICENSE_SOURCE does not explain the Extended License."

printf '  license: %s\n' "$LICENSE_SOURCE"

# ---------------------------------------------------------------------------
# 3. Release state
# ---------------------------------------------------------------------------
step "Checking the working tree"

if [[ -n "$(git status --porcelain)" ]]; then
  if [[ "${ALLOW_DIRTY:-0}" != "1" ]]; then
    git status --short >&2
    die "Uncommitted changes. Commit them first, or set ALLOW_DIRTY=1 for a staging build."
  fi
  printf '  WARNING: staging build from a dirty tree (not a release commit)\n'
else
  printf '  clean at %s\n' "$(git rev-parse --short HEAD)"
fi

# ---------------------------------------------------------------------------
# 4. Build a tree from the working tree without touching the real index
# ---------------------------------------------------------------------------
step "Collecting the source tree"

export GIT_INDEX_FILE="$WORK_DIR/index"
git read-tree HEAD
git -c core.autocrlf=false add -A
TREE=$(git write-tree)
unset GIT_INDEX_FILE

printf '  tree: %s\n' "$(git rev-parse --short "$TREE")"

# ---------------------------------------------------------------------------
# 5. Build and inject the Codester license
# ---------------------------------------------------------------------------
step "Building dist/codester/lms-$VERSION-codester.zip"

PREFIX="lms-$VERSION"
TMP_ARCHIVE="$WORK_DIR/$PREFIX.zip"
ARCHIVE="dist/codester/lms-$VERSION-codester.zip"

mkdir -p dist/codester
rm -f "$ARCHIVE"

git archive --format=zip --prefix="$PREFIX/" -o "$TMP_ARCHIVE" "$TREE"

"$PYTHON" - "$TMP_ARCHIVE" "$LICENSE_SOURCE" "$PREFIX/LICENSE.txt" "$ARCHIVE" <<'PY'
from pathlib import Path
import sys
import zipfile

source, license_path, target, output = sys.argv[1:5]
license_text = Path(license_path).read_text(encoding="utf-8").replace("\r\n", "\n").encode("utf-8")

with zipfile.ZipFile(source, "r") as src, zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as dst:
    for info in src.infolist():
        if info.filename == target:
            continue
        dst.writestr(info, src.read(info.filename))

    info = zipfile.ZipInfo(target)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = (0o644 & 0xFFFF) << 16
    dst.writestr(info, license_text)
PY

rm -f "$TMP_ARCHIVE"

# ---------------------------------------------------------------------------
# 6. Prepare the buyer folder layout
# ---------------------------------------------------------------------------
step "Renaming localhost/ to backend/"

"$PYTHON" scripts/prepare-release.py "$ARCHIVE" "$PREFIX"

# ---------------------------------------------------------------------------
# 7. Verify the archive
# ---------------------------------------------------------------------------
step "Verifying the archive"

"$PYTHON" - "$ARCHIVE" "$PREFIX" <<'PY'
from pathlib import Path
import re
import sys
import zipfile

archive, prefix = sys.argv[1:3]
errors = []
forbidden_patterns = [
    r'(^|/)\.env$',
    r'(^|/)\.env\.(local|production|docker)$',
    r'(^|/)node_modules/',
    r'(^|/)vendor/',
    r'(^|/)\.next/',
    r'(^|/)\.git/',
    r'(^|/)marketing/',
    r'(^|/)scripts/',
    r'(^|/)V1-RELEASE-PLAN\.md$',
    r'(^|/)CLAUDE\.md$',
    r'(^|/)\.cursor/',
    r'(^|/)\.mcp\.json$',
    r'(^|/)boost\.json$',
    r'(^|/)diag_query',
    r'(^|/)dist/',
    r'(^|/)localhost/',
]
required = [
    "README.md",
    "CHANGELOG.md",
    "UPGRADING.md",
    "LICENSE.txt",
    "docker-compose.yml",
    ".env.docker.example",
    "documentation/index.html",
    "backend/artisan",
    "backend/composer.lock",
    "frontend/package.json",
    "frontend/package-lock.json",
]

with zipfile.ZipFile(archive, "r") as zf:
    names = zf.namelist()
    if not names:
        errors.append("archive is empty")

    for name in names:
        for pattern in forbidden_patterns:
            if re.search(pattern, name):
                errors.append(f"forbidden path: {name}")
                break

    for item in required:
        if f"{prefix}/{item}" not in names:
            errors.append(f"missing required file: {item}")

    license_name = f"{prefix}/LICENSE.txt"
    if license_name in names:
        license_text = zf.read(license_name).decode("utf-8", "replace")
        if "Codester" not in license_text:
            errors.append("LICENSE.txt is not the Codester license (missing 'Codester')")
        if "Extended License" not in license_text:
            errors.append("LICENSE.txt does not mention the Extended License")
        if "Envato" in license_text:
            errors.append("LICENSE.txt still contains Envato text")

    env_name = f"{prefix}/.env.docker.example"
    if env_name in names:
        env_text = zf.read(env_name).decode("utf-8", "replace")
        if re.search(r"^APP_KEY=[A-Za-z0-9]{20,}", env_text, re.MULTILINE):
            errors.append(".env.docker.example contains a real APP_KEY")

    # The buyer-facing text must not route the buyer to the development repo or
    # to another marketplace. Both are rejection risks on Codester.
    for name in names:
        if not name.endswith((".md", ".txt", ".html")):
            continue
        data = zf.read(name).decode("utf-8", "replace")
        if "github.com/moyazdanian" in data:
            errors.append(f"development repository URL in {name}")
        if "CodeCanyon" in data or "Envato" in data:
            errors.append(f"other marketplace mentioned in {name}")

    print(f"  files: {len(names)}")
    print(f"  size:  {Path(archive).stat().st_size / 1024 / 1024:.1f} MB")

    if errors:
        print("\nErrors:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        sys.exit(1)

print("  archive contents are safe")
PY

step "Done"
printf '  package: %s\n' "$ARCHIVE"
printf '\nNext: unpack it into an empty directory, follow documentation/installation.html,\n'
printf 'and submit the Codester listing with marketing/codester/README.md.\n'
