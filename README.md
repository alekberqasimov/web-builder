# Web Builder v6

A browser-based multi-page website builder that runs entirely on static HTML, CSS and JavaScript. No account, remote database, payment system or backend is required.

## Current architecture

- `index.html` — V6 editor shell
- `v6.css` — core editor layout
- `v6-ux.css` — responsive UX/panel layer
- `v6-app.mjs` — V6 editor entry point
- `v6-ux.mjs` — panel pinning and dedicated Navigator UX
- `v6-custom-sections.mjs` — Custom Section layouts and editor add-zone UX
- `v5-*.mjs` — **current active functional engine modules used by V6**; the `v5` prefix is a compatibility/module name, not an unused old editor
- `tests/` — model, browser, responsive, drag-and-drop, custom-section and UX regression tests

The old pre-V6 shell and patch files have already been removed from the active branch. Do not delete a `v5-*.mjs` module just because of its name: current V6 imports these modules directly or indirectly. `tests/module-reachability.test.mjs` audits this automatically and fails CI if an orphan production module appears.

## Features

- Desktop drag-and-drop, touch long-press drag-and-drop and up/down fallback controls
- Left and right panel pin/unpin on desktop; drawer behavior on tablet/mobile
- Dedicated Navigator/Page Tree mode
- Adaptive block and element library with search, categories, favorites and recent items
- Custom Section library: blank, 1/2/3/4 columns, 6-item grid and nested containers
- Visible add places inside empty containers/columns, including touch-friendly mobile controls
- Inline text editing and rich element/block inspectors
- Desktop, tablet, mobile and custom-width canvas previews
- Responsive block styles and responsive Gallery columns
- Configurable desktop/mobile navigation menu, icon, dropdown/panel behavior and CTA
- Repeatable Image + Text and Gallery item counts from 1 to 500
- Undo/redo, duplicate/delete, saved blocks and page templates
- Multi-page projects, global header/footer, SEO metadata and responsive audit
- IndexedDB local project storage
- Project JSON import/export
- Static multi-page ZIP export with `robots.txt` and `sitemap.xml`

## Repository cleanliness

Production modules are checked from the V6 browser entry points. If a new `v5-*.mjs` or `v6-*.mjs` file is no longer reachable from the active application, CI reports it as an orphan so it can be removed deliberately instead of guessing from filenames.

Backup/rollback branches may keep historical code, but they are not part of the production Pages artifact.

## Development workflow

Production is intentionally protected from unfinished UI work:

1. Build and review changes on a work branch.
2. Run **V6 Preflight** in GitHub Actions (`workflow_dispatch`) or through the dedicated preflight branch.
3. Only move a fully green commit to `main`.
4. The **Deploy Web Builder v6 to Pages** workflow validates the same production wiring and browser regressions before deployment.

## Run locally

Serve the repository with any static server and open `index.html`. ES modules should be loaded over HTTP rather than `file://` for reliable browser behavior.

## Publish

GitHub Pages is deployed by `.github/workflows/pages.yml` from `main`. Do not use old shell files or manual patch layers in production.

Projects and embedded images are stored in the current browser through IndexedDB. Export project JSON periodically when a portable backup is required.
