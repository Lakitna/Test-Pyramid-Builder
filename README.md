# Test Pyramid Builder

The WYSIWYG test pyramid editor, split out of the [test-pyramids](../test-pyramids) search project
so it can grow on its own.

## Build

```
npm install
npm run build
```

This compiles the web app to `dist/web/` (bundled + minified JS, HTML, CSS, and the content-hashed
woff2 fonts). In watch mode:

```
npm start
```

## Run

Serve `dist/web/` with any static file server — this repo ships a zero-dependency one:

```
npm run serve:web
```

Open the printed URL (default `http://localhost:8080`). Click a layer to select it, drag its blue
edge handles to resize, drag layers vertically to reorder, click the "+" on any edge to insert a
layer, and click any label or note to edit it in place. Export as `.png` or `.svg`, and share any
pyramid by copying the link — the full pyramid is encoded as base64 JSON in the URL hash
(`#p=...`). See `src/generator/PLAN.md` for design details.

## Fonts

Style fonts come from `@fontsource` packages (OFL licensed). `npm run build:fonts` copies the
latin woff2 faces into `src/generator/fonts/` under content-hashed names and regenerates
`src/generator/fonts.generated.ts`. Commit both. Add a new typeface by installing its
`@fontsource` package and adding a MANIFEST entry in `scripts/build-font.mjs`.
