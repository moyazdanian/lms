# LMS API and admin panel

Laravel 12 application that serves the `/api/v1` REST API, the Filament admin
panel at `/admin`, lesson media, payment webhooks and certificates.

`localhost/` is the application root; the name is historical. It is the backend,
not a local-only folder.

For installation, configuration and feature documentation, read the project
handbook:

- [README.md](../README.md) — product overview, requirements and quick start
- [documentation/index.html](../documentation/index.html) — full handbook
- [documentation/admin.html](../documentation/admin.html) — admin panel guide
- [documentation/api.html](../documentation/api.html) — API reference
- [CHANGELOG.md](../CHANGELOG.md) — version history

Do not install this folder as a standalone shared-hosting site. The supported
deployment is the Docker Compose stack at the repository root; it installs PHP,
nginx, the queue worker, MySQL and the storefront for you.
