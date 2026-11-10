#!/usr/bin/env bash
#
# Builds the release package that is uploaded to CodeCanyon.
#
# The package is produced with `git archive`, so it contains exactly the files
# committed to the repository — never .env files, node_modules, vendor, build
# output or local storage. Developer-only files listed in .gitattributes with
# `export-ignore` (CLAUDE.md, .cursor/, scripts/, the release plan) are left out
# as well.
#
# Usage:
#   scripts/package.sh              # version taken from the top of CHANGELOG.md
#   scripts/package.sh 1.0.1        # explicit version
#
# Output: dist/lms-<version>.zip

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
command -v unzip >/dev/null 2>&1 || die "unzip is required."

# ---------------------------------------------------------------------------
# 1. Version
# ---------------------------------------------------------------------------
step "Resolving version"

if [[ $# -gt 0 ]]; then
  VERSION="$1"
else
  VERSION=$(sed -nE 's/^## \[([0-9]+\.[0-9]+\.[0-9]+)\].*/\1/p' CHANGELOG.md | head -n1)
fi

[[ -n "${VERSION:-}" ]] || die "Could not read the version. Pass it explicitly: scripts/package.sh 1.0.0"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "Version '$VERSION' is not x.y.z."

printf '  version: %s\n' "$VERSION"

# ---------------------------------------------------------------------------
# 2. Working tree must be clean
# ---------------------------------------------------------------------------
step "Checking the working tree"

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  git status --short --untracked-files=no >&2
  die "Uncommitted changes. Commit them first so the package matches a real revision."
fi

printf '  clean at %s\n' "$(git rev-parse --short HEAD)"

# ---------------------------------------------------------------------------
# 3. Nothing sensitive or heavy is tracked
# ---------------------------------------------------------------------------
step "Pre-flight checks"

git ls-files > "$WORK_DIR/tracked.txt"

if grep -qE '(^|/)\.env$|(^|/)\.env\.(local|production|docker)$' "$WORK_DIR/tracked.txt"; then
  die "A real .env file is tracked. Remove it with: git rm --cached <path>"
fi

if grep -qE '(^|/)(node_modules|vendor)/' "$WORK_DIR/tracked.txt"; then
  die "node_modules or vendor is tracked. Untrack it with: git rm -r --cached <path>"
fi

if grep -qE '(^|/)\.next/' "$WORK_DIR/tracked.txt"; then
  die "Next.js build output is tracked."
fi

if grep -qE '\.(exe|dll|msi)$' "$WORK_DIR/tracked.txt"; then
  die "Windows binaries are tracked. They are not part of the product."
fi

if grep -qE '(^|/)[^/]*\.(pem|key|pfx|p12)$' "$WORK_DIR/tracked.txt"; then
  die "TLS keys or certificates are tracked. Remove them with: git rm --cached <path>"
fi

# A real gateway secret in an example file is a blocker, not a warning.
if git grep -qE 'whsec_[0-9a-f]{20,}|sk_live_[A-Za-z0-9]{10,}|pk_live_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}' -- .; then
  git grep -nE 'whsec_[0-9a-f]{20,}|sk_live_[A-Za-z0-9]{10,}|pk_live_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}' -- . >&2
  die "A live-looking secret is committed to the repository."
fi

# The only files allowed under storage/ are the placeholder .gitignore files.
grep -E '(^|/)storage/' "$WORK_DIR/tracked.txt" | grep -vE '/\.gitignore$' > "$WORK_DIR/storage.txt" || true
if [[ -s "$WORK_DIR/storage.txt" ]]; then
  cat "$WORK_DIR/storage.txt" >&2
  die "Uploads or logs are tracked. Only storage placeholders belong in git."
fi

REQUIRED_FILES=(
  README.md
  CHANGELOG.md
  LICENSE.txt
  docker-compose.yml
  .env.docker.example
  documentation/index.html
  localhost/artisan
  localhost/composer.lock
  frontend/package.json
  frontend/package-lock.json
)

for required in "${REQUIRED_FILES[@]}"; do
  grep -qxF "$required" "$WORK_DIR/tracked.txt" || die "Required file is missing from the repository: $required"
done

printf '  no secrets, dependencies or build output tracked\n'

# ---------------------------------------------------------------------------
# 4. Build the archive
# ---------------------------------------------------------------------------
step "Building dist/lms-$VERSION.zip"

PREFIX="lms-$VERSION"
ARCHIVE="dist/$PREFIX.zip"

mkdir -p dist
rm -f "$ARCHIVE"

git archive --format=zip --prefix="$PREFIX/" -o "$ARCHIVE" HEAD

# ---------------------------------------------------------------------------
# 5. Verify the produced archive
# ---------------------------------------------------------------------------
step "Verifying the archive"

# -Z1 prints names only; unzip emits CRLF on Windows, hence tr.
unzip -Z1 "$ARCHIVE" | tr -d '\r' > "$WORK_DIR/archive.txt"

# Anything the buyer must never see: real env files, dependencies, build output,
# and the developer-only files excluded via .gitattributes.
FORBIDDEN='(^|/)\.env$|(^|/)\.env\.(local|production|docker)$|node_modules/|/vendor/|\.next/|/CLAUDE\.md|/\.cursor/|/\.mcp\.json|/boost\.json|V1-RELEASE-PLAN\.md|/scripts/|diag_query'

if grep -qE "$FORBIDDEN" "$WORK_DIR/archive.txt"; then
  grep -E "$FORBIDDEN" "$WORK_DIR/archive.txt" | head -20 >&2
  rm -f "$ARCHIVE"
  die "The archive contains files that must not ship. Check the export-ignore rules in .gitattributes."
fi

for required in README.md CHANGELOG.md LICENSE.txt docker-compose.yml .env.docker.example \
                documentation/index.html localhost/artisan frontend/package.json; do
  grep -qxF "$PREFIX/$required" "$WORK_DIR/archive.txt" || die "The archive is missing $required"
done

# The shipped example files must not carry real credentials.
if unzip -p "$ARCHIVE" "$PREFIX/.env.docker.example" 2>/dev/null | grep -qE 'APP_KEY=[A-Za-z0-9]{20,}'; then
  rm -f "$ARCHIVE"
  die ".env.docker.example contains a real APP_KEY."
fi

FILE_COUNT=$(wc -l < "$WORK_DIR/archive.txt" | tr -d ' ')
SIZE=$(du -h "$ARCHIVE" | cut -f1)

step "Done"
printf '  package: %s\n' "$ARCHIVE"
printf '  files:   %s\n' "$FILE_COUNT"
printf '  size:    %s\n' "$SIZE"
printf '\nNext: unpack it into an empty directory and follow documentation/installation.html\n'
printf 'or documentation/docker.html before uploading.\n'
