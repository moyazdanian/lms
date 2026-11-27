#!/usr/bin/env python3
"""Prepare a buyer package without changing the local checkout.

The repository keeps the Laravel application in ``localhost/`` because that is
the folder name used by the local development setup. Marketplace buyers get the
same application in ``backend/`` instead, which is clearer and avoids the
"localhost" confusion.

This script operates on an already-built ZIP:

* renames ``<prefix>/localhost/`` to ``<prefix>/backend/``;
* updates the buyer-facing paths in the README, handbook, compose file, license
  and git metadata;
* leaves URLs such as ``http://localhost``, ``api.localhost`` and application
  defaults untouched.

Usage:
    python3 scripts/prepare-release.py dist/lms-1.0.0.zip lms-1.0.0
"""

from __future__ import annotations

import os
import re
import sys
import tempfile
import zipfile
from pathlib import Path

TEXT_PATHS = {
    "README.md",
    "CHANGELOG.md",
    "UPGRADING.md",
    "LICENSE.txt",
    ".gitignore",
    ".gitattributes",
    "docker-compose.yml",
    "localhost/README.md",
    "backend/README.md",
    "documentation/index.html",
    "documentation/installation.html",
    "documentation/students.html",
    "documentation/instructors.html",
    "documentation/admin.html",
    "documentation/api.html",
}

README_ROOT_OLD = (
    "`localhost/` is the Laravel application root — that naming is historical; it is\n"
    "the backend, not a local-only folder."
)
README_ROOT_NEW = (
    "`backend/` is the Laravel application root. It is the backend, not a\n"
    "local-only folder."
)

README_BACKEND_OLD = (
    "`localhost/` is the application root; the name is historical. It is the backend,\n"
    "not a local-only folder."
)
README_BACKEND_NEW = (
    "`backend/` is the application root. It is the backend, not a local-only folder."
)


def relative_name(name: str, prefix: str) -> str:
    return name[len(prefix) + 1 :] if name.startswith(prefix + "/") else name


def renamed(name: str, prefix: str) -> str:
    old = f"{prefix}/localhost"
    new = f"{prefix}/backend"
    if name == old:
        return new
    if name.startswith(old + "/"):
        return new + name[len(old) :]
    return name


def transform_text(text: str, rel: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Update the prose that described the historical folder name, before the
    # generic path replacement. The packaged README should not call backend/
    # "historical".
    text = text.replace(README_ROOT_OLD, README_ROOT_NEW)
    text = text.replace(README_BACKEND_OLD, README_BACKEND_NEW)

    if rel == "docker-compose.yml":
        text = text.replace("context: ./localhost", "context: ./backend")

    if rel == ".gitattributes":
        text = text.replace("/localhost/", "/backend/")

    # Commands that name the folder without a trailing slash.
    text = text.replace("cd localhost", "cd backend")
    text = text.replace(
        "ls docker-compose.yml .env.docker.example localhost frontend",
        "ls docker-compose.yml .env.docker.example backend frontend",
    )

    # Treat ./localhost as the build-context path, never as a hostname.
    text = text.replace("./localhost", "./backend")

    # Replace directory references, but not URL hosts:
    #   http://localhost/   -> preceded by '/', skipped
    #   api.localhost/      -> preceded by '.', skipped
    #   `localhost/`        -> replaced
    #   (localhost/docs)    -> replaced
    text = re.sub(r"(?<![\w./:-])localhost/", "backend/", text)
    return text


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: prepare-release.py <archive.zip> <root-prefix>", file=sys.stderr)
        return 2

    archive = Path(sys.argv[1])
    prefix = sys.argv[2].strip("/")
    if not archive.is_file():
        print(f"archive not found: {archive}", file=sys.stderr)
        return 1

    renamed_entries = 0
    rewritten_files = 0
    with tempfile.NamedTemporaryFile(
        prefix=f"{archive.stem}-", suffix=".zip", dir=archive.parent, delete=False
    ) as temp:
        temp_path = Path(temp.name)

    try:
        with zipfile.ZipFile(archive, "r") as src, zipfile.ZipFile(
            temp_path, "w", zipfile.ZIP_DEFLATED
        ) as dst:
            for info in src.infolist():
                old_name = info.filename
                new_name = renamed(old_name, prefix)
                if new_name != old_name:
                    renamed_entries += 1

                data = src.read(old_name)
                rel = relative_name(old_name, prefix)
                if rel in TEXT_PATHS and not info.is_dir():
                    try:
                        text = data.decode("utf-8")
                    except UnicodeDecodeError:
                        pass
                    else:
                        updated = transform_text(text, rel)
                        if updated != text:
                            data = updated.encode("utf-8")
                            rewritten_files += 1

                new_info = zipfile.ZipInfo(new_name, date_time=info.date_time)
                new_info.compress_type = info.compress_type
                new_info.external_attr = info.external_attr
                new_info.internal_attr = info.internal_attr
                new_info.create_system = info.create_system
                new_info.comment = info.comment
                new_info.extra = info.extra
                dst.writestr(new_info, data)

        os.replace(temp_path, archive)
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise

    print(f"  renamed {renamed_entries} entries from localhost/ to backend/")
    print(f"  updated {rewritten_files} buyer-facing text files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
