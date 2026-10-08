# Test Pyramid Builder — agent memory

Facts accumulated while the app lived in `test-pyramids/src/generator/`. Split into this repo on
2026-10-08 with a FLAT layout: the old `src/generator/*` is now `src/*`. Pre-split git history is in
`C:\code\test-pyramids`.

## Repo & build

- `npm run build` = `tsc && tsdown` (migrated rollup→tsdown 2026-10-08; `tsc` alone = typecheck
  since tsconfig has `noEmit: true`). `tsdown.config.ts`: entry `{ generator: 'src/index.ts' }` →
  `dist/web/generator.js` (ESM, `platform: browser`, `target: esnext`, `minify: true` via Oxc,
  `clean` default-on replaces rollup-plugin-delete), native `copy` option replaces
  rollup-plugin-copy (index.html, styles.css, `fonts/*.woff2` → `dist/web/fonts`; copied files are
  watched in watch mode). rollup-plugin-cleanup dropped (no console.\* in src, minify strips
  comments). HTML/CSS minification (clean-css styles.css, html-minifier-terser index.html) runs in
  the config's `hooks: { 'build:done' }` — fires after the bundle is written AND after copy, in
  build and watch mode (verified: raw CSS re-copied on rebuild gets re-minified). Needs
  @types/clean-css + @types/html-minifier-terser devDeps (neither ships types; config file is TS).
  Bundle has ZERO runtime npm deps.
- tsdown does NOT typecheck (unlike @rollup/plugin-typescript) — hence `tsc &&` in build. tsconfig
  modernized 2026-10-08: browser app — `moduleResolution: bundler`,
  `lib: [ESNext, DOM, DOM.Iterable]`, `types: []` (src uses NO Node APIs), strict +
  `verbatimModuleSyntax` + `erasableSyntaxOnly` + `noUnusedLocals/Parameters` + `skipLibCheck`,
  `include: ["src"]` (tsdown.config.ts is outside it, loaded by tsdown itself). Enabling
  noUnusedLocals caught dead `truncate()` in editor.ts (removed). tsdown warns Node 22.14 is
  deprecated (wants ≥22.18).
- `npm start` = `tsdown -w`. `npm run serve:web` = `node scripts/serve-web.mjs [port]` (default
  8080, zero deps; `fonts/` served `font/woff2` + immutable, everything else no-store).
- `npm run build:fonts` = `scripts/build-font.mjs`: copies latin woff2 from @fontsource devDeps into
  `src/fonts/` under content-hashed names (sha256[:10] embedded) and rewrites
  `src/fonts.generated.ts` URL manifest. COMMIT BOTH. 19 faces ~310KB woff2.
- Gotcha (PowerShell): `scripts/serve-web.mjs` resolves `dist/web` relative to CWD — run from the
  repo root.

## Model & URL state

- `layers[]` (index 0 = TOP, 1..20) + `widths[]` (length layers+1, 0..100, positional silhouette;
  one entry per horizontal edge). Trapezoids between edges — not always a triangle, intentional.
- No `defaultPyramid()` anymore — boot default is `PRESETS[2]` ("Better pyramid", the user's 5-layer
  one); presets reference `PALETTE[i]` at load time so palette swaps propagate.
- Pyramid state = base64url JSON in URL hash `#p=`. Style = `#s=` param (omitted for classic) +
  localStorage `'test-pyramid-style'`; precedence URL > stored > default; URL style never overwrites
  stored pref. Theme key: `'test-pyramid-theme'`. NO legacy key migration (user: "no need to support
  backwards compatibility, keep it simple").
- Invalid hash → notice message + default pyramid (INVALID_HASH_MESSAGE in index.ts).

## Shapes ('Apply shape…' select)

- `applyShape` just samples `shapeProfile(shape, edge/layers)` into `widths[]` — pure data, sides
  stay straight segments. New shape = SHAPES entry + SHAPE_LABELS + shapeProfile case ONLY.
- 2026-10-08 lesson: user added 'eiffel-tower' (profile `t*t`, concave) THEMSELVES as a one-line
  profile after I over-designed it (model `curve` field + Bezier sampling — rejected as "spinning
  wheels"). If a feature fits an existing extension point, just add the case.

## Style system (`src/styles/`)

- PyramidStyle contract (types.ts) + registry (index.ts, DEFAULT='classic'). Ids are public API —
  they live in shared URLs and localStorage; NEVER rename.
- STYLES = 7: classic, draftsman, contrast, toon, de-stijl, unicorn, bartosz. Removed over time:
  munch, monet, pride, sofius — old URLs/localStorage fall back to classic via `getStyle`.
- New style = one file + import + array entry in styles/index.ts + (if new typeface) @fontsource
  devDep + MANIFEST entry in scripts/build-font.mjs + `npm run build:fonts`. Verify via `#s=<id>`
  - screenshots (both themes) + `?validate-styles` console check.
- classic: colorSource 'data' — honors stored layer colors, old links unchanged.
- draftsman: hatch patterns + jitter + double frame, Patrick Hand / IBM Plex Mono.
- contrast: AAA, Atkinson Hyperlegible, validate.ts must pass 7:1/3:1.
- toon: jitter + bubble chips, Baloo 2 / Comic Neue.
- de-stijl: plates + rules, Jost.
- unicorn (file styles/unicorn.ts, const unicornStyle; old 'unicorn-barf' naming fully gone):
  per-layer candy linearGradients (fills.mode='gradient') + deterministic 50 sparkles,
  Fredoka/Quicksand, deep-plum-on-white text. Sparkles clamped to [padding, size-padding] so glitter
  never crosses the frame.
- bartosz (bartosz.nl brand): deliberately SPARSE (user: "the brand only has 2-3 colors, lean into
  it"). LIGHT: white ground, purple #5A2CBC ink everywhere (title/notes/hint/chipText), fills
  alternate brand purple with mint `['#5a2cbc','#92e8e3','#24124d','#92e8e3','#7a4fd0','#3b1e78']` —
  KNOWN, DELIBERATE exception: the two mint bands are 1.4:1 on white and `?validate-styles` warns 2
  issues for bartosz. Do NOT "fix" this; user chose brand fidelity over the 3:1 rule (dark purples +
  white gaps carry boundaries). Pills = white fill + 2px purple outline; chrome pale-lilac (#f3f0fa
  bg, #d5c9ec border, #6f5aa8 muted, #ece4f8 hover, accent #5A2CBC, danger #d81b60). DARK
  (approved): night purple #150C2E, lilac→mint bright fills, white pill chips + purple text, accent
  #9f7bea + --accent-ink #1B0E3F. Flat solid fills, layerOutline 0, separatorWidth 4, pill chips
  rx16/h32, Montserrat 400/600/700.
- sofius ARCHIVE (removed from tree; brand spec kept in case it returns — sofius.com, 3-color system
  from the site's CSS vars: --primary #2e548c navy INK, --secondary #fa6375 coral, teal #00a89e CTA,
  on white): flat solid bands + white gaps (layerOutline 0, separatorWidth 4), white pill chips +
  navy outline/text, no jitter/frame, Be Vietnam Pro 400/500/600 (would need
  @fontsource/be-vietnam-pro devDep + MANIFEST entry). Zero-validation trick: exact teal/coral are
  <3:1 on white, so band fills used hairline-deeper variants
  `['#2e548c','#00908a','#ef4b60','#1b3a63','#006b64','#c0324a']` (all ≥3:1); true brand hues only
  in chrome. DARK: night navy #0f1e33, bright tints
  `['#6f9bd8','#4fd0c6','#ff8a97','#a9c6ea','#8fe6dd','#ffb3bd']`, deep-surface chips + teal
  outline + white text, accent #6f9bd8 + --accent-ink #0b1626.

## Fonts (`src/fonts.ts`, `fonts.generated.ts`, `fonts/`)

- Pipeline (2026-10-08, replaced data-URI-in-bundle): static hashed woff2 files, NOT inlined in the
  JS bundle.
- LAZY per-style injection: `ensureFontFaces(keys)` adds @font-face rules (url('fonts/…woff2')) only
  for styles in use; `loadStyleFonts` calls it first. GOTCHA: Chrome eagerly fetches the src of
  EVERY @font-face rule in the document — injecting all 19 at boot downloads all 19. index.ts
  injects only the active style's faces at boot; loadFromHash is async and gates render on the
  applied style's fonts. First render is gated on loadStyleFonts (canvas metrics!).
- `embeddedFontFaceCss()` fetches the same URLs on demand → base64 data URIs for exports (in-memory
  cache, offline-faithful SVG/PNG). Export fns are async: `buildSvgString` / `exportSvg` /
  `buildPngSheet`; `measurePngSheet` stays sync (viewBox only, no fonts).
- Keep fonts OFL-licensed — they are redistributed as files.

## Fills & rendering

- Render-time `effectiveLayerFill` (exported): colorCustom > hatch (effectiveLayerPattern) > style
  pattern/gradient cycle > palette[positional] > data color. Per-layer overrides (`patternColor`,
  `gradientColors`) are optional model fields (no version bump) that TRAVEL WITH THE LAYER across
  styles (hatched layer stays hatched in Cartoon); edited via the toolbar "How this layer is filled"
  select (Style default / Custom color / patterns / gradients; the layer's own override is always
  listed even when the current style lacks it). Color picker tints patterns when the layer hatches
  (patternColor), else sets solid color + colorCustom (clearing overrides). The predefined "Gradient
  1..N" cycle pickers and the `fillGradient` model field were REMOVED — style cycle is default-only;
  users customize via 'Custom gradient' (seeds layer.gradientColors, 2–6 validated #rrggbb, one
  picker per stop with live stop-color updates).
- Patterns AND gradients are colored per layer: `StyleFills.patterns: PatternDef[] {name, color?}`
  (draftsman = colored-pencil tin). `effectiveLayerPattern` / `effectiveLayerGradient` (both
  exported) resolve per-layer {name,color} / {stops}; fillDefs emits per-layer ids `pyr-pat-{i}` /
  `pyr-grad-{i}`.
- TWO-PASS layer rendering: pass 1 `<path class="layer-fill" pointer-events=all>` (hit target +
  tooltip; unfilled 'none' layers stay clickable), pass 2
  `<path class="layer-stroke" pointer-events=none>` (all strokes above all fills; round join+cap
  closes corner notches — no more "double line" on silhouettes), pass 3 labels. `updateGeometryLive`
  must set `d` on ALL `path[data-layer-index]` (both classes). Cursor CSS:
  `path.layer-fill.editable`.
- Jitter is SMOOTH + GLOBAL (`sketchGeometry`): band-limited noise (3 random sine harmonics) over
  each side's arc length — corners are shared jittered points between adjacent layers & their
  horizontal edges (sine envelope keeps edge endpoints exact; taper anchors apex/base). Independent
  per-layer side wobble was the cartoon "double line" root cause; structurally gone at ANY amplitude
  now. `layerShapePaths(model,style)` batches; `layerShapePath` wraps it.
- Label text: chip/plate/bubble text is `text-anchor: middle` at centerX (NOT start at chipX+padX) —
  immune to canvas-vs-SVG width drift; affects all chip styles. Chip rect stays sized
  textWidth+2\*padX.
- Text rendering: SVG `<text>` collapses newlines to spaces, so multi-line fields (notes,
  descriptor) are split via `wrapText()` in render.ts into one `<text>` per line inside a
  `<g data-edit-field>` (group = click target). `wrapText` treats `\n` as explicit breaks, keeps
  blank lines, returns [] for ''.

## Layout & export

- Legend wrap uses `(legendWidth-8)*0.97` — canvas measureText runs ~1.5% narrower than SVG text
  rendering; without it lines overflow the viewBox. Framed styles: layout padding ≥18 and descriptor
  bottom margin 16 (classic keeps 6/12 — unchanged geometry).
- `legendRule` guarded by hasLegend (no floating rule when the legend column collapses in compact
  exports). `legendLeaders: { width, color: {light, dark} } | null` — draftsman {0.9,
  #8a867c/#8a857a graphite}, toon {1.75, #463c2e/#e8ecf5}. Leader margins: edge+10 → legendX−10.
- `layout.descriptorSpace` = live vertical gap between pyramid bottom edge and descriptor block
  (descriptorTop = bandsBottom + descriptorSpace). `layout.titleSpace` = reserved band above the
  pyramid (baseline at 62.5%). Typography roles split: MultilineTypographyRole (notes, descriptor —
  carry lineHeight) vs TypographyRole (title, label, attribution). Descriptor block centered under
  canvas as a whole, lines left-aligned (measure with `textWidth`, anchor `start`); canvas height
  grows with line count (lineHeight 17).
- Content-aware export layout (editing=false only): titleSpace/legendWidth/legendGap/descriptor band
  collapse when empty → bare pyramid exports tight (Empty preset: 654×505). No title keeps ONE
  padding of top clearance (symmetric sheet). Attribution is a CAPTION BAND: contentHeight = the
  sheet (frame + sparkles clamp to it), totalHeight = contentHeight + 22 when attributing, baseline
  at contentHeight+16 — below the frame. Editing canvas keeps full layout (placeholders, no
  jump-while-typing). CRITICAL: edgeGeometry/sketchGeometry/layerShapePaths take an optional
  `bandsTop` param (default = padding+titleSpace, i.e. edit-mode full reservation);
  `renderPyramidSvg` MUST pass its content-aware bandsTop — paths and sheet must share one top
  offset (this desync caused the "model too high / labels shifted up" export bug).
- `RenderOptions.attribution` draws a subtle 10px `palette.hint` URL bottom-right; export.ts passes
  `attribution: true`. Canvas view never shows it.
- Export dialogs (2026-10): Share menu "Download .png…" / "Download .svg…" open native
  `<dialog class="modal">`s (#png-dialog / #svg-dialog). Layout: title, checkerboard
  `.modal-preview` img, body (Color mode Light/Dark radios, Transparent background, PNG-only Width
  px 120–8000 default 1200 + `.field-hint` "Exports at about W × H px", File name LAST above
  actions), Cancel/Download. Backdrop click closes (target===dialog — content fills padding:0 box).
  Settings per-dialog in localStorage `'test-pyramid-png-export'` / `'test-pyramid-svg-export'`
  {filename,width(png),transparent,theme} (older sizeMode ignored). export.ts:
  `buildPngSheet`+`rasterizeSheet` → `exportPng(model,PngExportOptions)`, `measurePngSheet` (sync),
  `renderPngPreview→Blob` (≤scale1, 150ms debounce, token-guarded);
  `buildSvgString(model,{dark,transparent})` (async — font data URIs) doubles as SVG preview blob
  URL (token-guarded rebuild) and feeds `exportSvg(model,SvgExportOptions)` (async, callers .catch).
  Filename via `normalizeFilename(raw,fallback,ext)`. Keydown guard: early-return when either dialog
  open.

## Chrome / UI

- `styleState.applyChromeVars` writes CSS vars (--font-ui etc.) on :root and
  `documentElement.dataset.style = style.id` (enables style-keyed chrome CSS); re-apply on theme
  toggle. Style selector dropdown beside theme button (#btn-style / #style-menu, .style-wrap).
- `--accent-ink` (2026-10): OPTIONAL ChromeToken = readable text color ON accent-filled surfaces
  (button.primary). styles.css :root defaults #ffffff; applyChromeVars REMOVEs the property when a
  style omits it. Any light-accent style MUST define it (draftsman white-on-paper bug was fixed this
  way).
- Contrast chrome rule: `:root[data-style='contrast']` gets 2px borders (modal, fields, segments,
  action buttons) and an INVERTED primary button (`background: var(--text); color: var(--surface)` =
  21:1 either theme) — its accent #6c8cff only reached 3.5:1 with white ink, breaking the style's
  ≥7:1 promise. Its CANVAS was always AAA; only chrome needed this.
- `validate.ts`: fill-vs-ground 3:1 checked only for styles without outlines (contrast); run in
  browser via `?validate-styles`.

## User / design constraints (owner has dyslexia)

- NO all-caps anywhere (chips render label as typed, no text-transform; tracking ≤0.01em/0.2px).
- Avoid acid/neon yellow accents (contrast failures); accent = Klein blue #002fa7 light / #6c8cff
  dark (strong on both themes). Prefer mixed case, bold weight + color blocks.
- Wants the SIMPLEST direct implementation; if a feature fits an existing extension point, add the
  case — don't expand the architecture (see Shapes lesson).
- `src/index.ts` carries the user's "written with AI" header comment — keep that style of candid
  annotation.
