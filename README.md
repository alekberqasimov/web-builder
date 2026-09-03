# Web Builder v2

A browser-based multi-page website builder. It runs entirely on static HTML, CSS and JavaScript — no account, remote database or backend is required.

## Features

- Desktop drag-and-drop plus touch reordering and up/down controls
- Inline text editing
- Section colors, spacing, width and alignment controls
- Desktop, tablet and mobile previews
- Undo and redo
- Multi-page projects and automatic navigation
- Per-page language and SEO metadata
- Image upload, ALT text and object-fit controls
- IndexedDB browser storage for projects and embedded images
- Project JSON import/export
- Multi-page website ZIP export with `robots.txt` and `sitemap.xml`

## Run locally

Open `index.html`, or serve the folder with any static server.

## Publish

The repository is ready for GitHub Pages. Use **Settings → Pages → Deploy from a branch**, select `main` and `/ (root)`.

Projects and images are stored in the current browser through IndexedDB. Export the project JSON periodically if you want a portable backup. Exported websites use self-contained image data, so the ZIP can be uploaded to any static hosting service.
