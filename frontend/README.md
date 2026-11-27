# LMS storefront

Next.js 15 App Router storefront for the LMS platform. It renders the public
site and the student/instructor dashboards, and talks to the Laravel API under
`/api/v1`.

For installation, configuration and feature documentation, read the project
handbook:

- [README.md](../README.md) — product overview, requirements and quick start
- [documentation/index.html](../documentation/index.html) — full handbook
- [CHANGELOG.md](../CHANGELOG.md) — version history

Do not install this folder as a separate production site. The supported
deployment is the Docker Compose stack at the repository root; it builds this
application and connects it to the API, MySQL, queue worker and Caddy.
