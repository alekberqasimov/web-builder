# Premium Editor UX v2

Working branch: `premium-editor-ux-v2`
Base production commit: `ed4b2312b34c356ab427532977371c1699c5064a`

## Scope

- calmer professional editor chrome with reduced visual noise
- SVG controls instead of placeholder Unicode glyphs for primary editor actions
- current-page and save-state context on desktop
- `Ctrl/Cmd + K` command palette for common editor actions
- localized library filters in RU/AZ/EN
- dedicated `PRO` library filter exposing the curated premium collection
- visible result count for library filters
- compact mobile behavior without desktop context crowding the toolbar
- no changes to exported customer-site visual styling from editor-only CSS

## Validation gate

The branch must not be merged unless `V6 Preflight` passes completely. The gate includes the existing model/unit suite, exact Pages artifact build, all existing browser regressions, and `tests/e2e-editor-premium-v6.mjs` covering desktop/mobile overflow, command palette behavior, SVG editor controls, PRO filtering, result count, and filter localization.
