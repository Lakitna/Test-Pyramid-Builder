# Test Pyramid Builder

A dependency-free, **WYSIWYG editor for test pyramids** — and trophies, honeycombs, or any other
stacked silhouette. Build a pyramid visually, style it, then share it as a link or export it as
`.png` / `.svg`. The whole pyramid lives in the page URL, so a link _is_ the document: no backend,
no account, nothing to lose.

## Highlights

- **WYSIWYG editing** — click to select, drag the blue edge handles to resize, drag layers to
  reorder, and single-click any label, note, title or caption to edit it in place.
- **Shapes** — pyramid, inverted pyramid, honeycomb, rectangle, trophy, Eiffel tower (and inverted).
- **Presets** — ready-made pyramids with notes, including Mike Cohn's original pyramid, Kent C.
  Dodds' trophy, and Spotify's honeycomb.
- **Visual styles** — Classic, Draftsman, High contrast, Cartoon, De Stijl, Unicorn, Bartosz. A
  style only changes how a pyramid _looks_, never what it _is_.
- **Light / dark theme**, with a per-export color mode and optional transparent background.
- **Share by URL** — the full pyramid is encoded as base64 JSON in the URL hash.
- **Export** — faithful `.svg` and `.png` with a custom pixel width and embedded fonts (works
  offline).
- **Undo / redo** and keyboard shortcuts throughout.
- Zero runtime dependencies: vanilla TypeScript rendering to SVG.

## Quick start

```bash
npm install
npm run build      # type-checks, then bundles the web app to dist/web/
npm run serve:web  # zero-dependency static server → http://localhost:8080
```

Open the printed URL. To rebuild on every change, run `npm start` (watch mode) in one terminal and
serve `dist/web/` in another.

## Using the editor

**On the canvas**

- Click a layer to select it (a tint, dashed outline and drag handles appear); click empty space or
  press `Esc` to deselect.
- Drag a layer's blue edge handles to resize that edge — symmetric around the center, with a live
  width badge.
- Drag a layer up or down to reorder it. The silhouette stays put; the layer's contents move.
- Click the **+** on a selected layer's top or bottom edge to insert a new layer there.
- Single-click any label, note, the title (above) or the descriptor (below) to edit it in place.
  `Enter` commits and `Esc` cancels; `Shift+Enter` adds a line in multi-line fields.

**Toolbar** (directly above the canvas)

Undo / redo · `Use preset…` · `Apply shape…` · move up / down · delete · fill controls · Top /
Bottom width fields. The selection-only controls appear whenever a layer is selected.

**Fill controls** let you override how a layer is painted: keep the style default, pick a custom
color, choose a hatch pattern (in pattern styles), or author a custom gradient (in gradient styles).
A hand-picked color becomes data and travels with the layer across styles.

**Keyboard**

| Shortcut                              | Action                    |
| ------------------------------------- | ------------------------- |
| `Ctrl` + `Z`                          | Undo                      |
| `Ctrl` + `Y` / `Ctrl` + `Shift` + `Z` | Redo                      |
| `Del` / `Backspace`                   | Delete the selected layer |
| `Esc`                                 | Deselect / cancel editing |

A pyramid holds **1–20 layers**; every edge width is a relative value from **0 to 100**.

## Sharing & the URL

The complete pyramid is encoded in the URL hash and kept in sync as you edit (debounced):

```
#p=<base64url JSON>&s=<style-id>
```

**Copy link** (in the **Share ▾** menu) puts it on your clipboard. The `s` parameter is omitted for
the default Classic style. Opening a link with `#p=` loads exactly that pyramid; a corrupt or
incompatible hash falls back to a default pyramid with a warning banner.

## Export

The **Share ▾** menu also offers `Download .svg…` and `Download .png…`, each with a preview dialog:

- **Color mode** — render light or dark, independent of the current theme.
- **Transparent background** — optional.
- **Width** (PNG only) — rasterized at your chosen pixel width (120–8000 px, default 1500).
- **File name**.

Exports are built from a fresh SVG, so selection handles and editing affordances never leak into the
files. Style fonts are embedded as data URIs, so the image looks identical offline.

## Made with vibes

This code is fully vibe-coded. Not because I couldn't write it myself, but because I don't have the
time to do it. This project would not exist without AI.

Be careful to keep your sanity while reading this code. You have been warned.

## License

Released under the [MIT License](LICENSE). Bundled fonts remain under their own (OFL) licenses.
