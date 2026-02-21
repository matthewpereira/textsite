# BlurHash Loading Placeholder

**Branch:** `feature/blurhash-loading`

## Goal

Show a blurry, colour-accurate preview of each photo while the full image loads, then fade it out smoothly once the real image is ready. No layout shift, no spinner, no blank space.

## Strategy

Use [BlurHash](https://blurha.sh/) — a compact ~30-character string that encodes a blurry image. Decode it client-side with the `blurhash` npm package into pixel data, draw it onto an off-screen canvas, export a data URL, and render that as an `<img>` overlay on top of the real photo while it loads.

## What's been done

### BlurHash generation
- Script at `/tmp/blurhash-gen/gen-default.mjs` generates hashes using `sharp` + `blurhash` at 10 concurrent workers. Processed 84 images in ~5 seconds.
- Hashes for the default gallery are stored in `src/data/blurHashes.json` (keyed by image ID).
- `GalleryImage` type in `types.ts` has `blurHash?: string` added.
- `GalleryImage.tsx` reads `image.blurHash ?? blurHashes[image.id]` to find a hash.

### Playground
- `/playground` route (`src/views/PlaygroundView.tsx`) compares three loading techniques side-by-side: Spinner, Fade-in, CSS-only, and BlurHash. Has a Reload button to repeat the effect.

### Data URL approach (current)
In `GalleryImage.tsx`, a `useMemo` decodes the BlurHash into a `32×N` pixel buffer, draws it on an off-screen canvas, and calls `canvas.toDataURL()` to get a data URL used as the blur `<img>` src.

### Timing
- Double `requestAnimationFrame` before setting `imageReady = true` ensures the browser paints at `opacity: 0` before the CSS transition starts, preventing a flash of the loaded image.

## Failures and what was tried

### 1. Blur renders at 32px (tiny)
`<img src={dataUrl}>` uses the data URL's intrinsic size (32px wide) when `width: auto`. CSS `max-width`/`max-height` only shrink, never expand. The blur appeared as a tiny thumbnail.

**Tried:** adding `width={image.width} height={image.height}` HTML attributes — this set the intrinsic size correctly but prevented CSS `max-height` from proportionally shrinking the width, making the blur too wide.

### 2. Blur too wide
Setting both `width` and `height` attrs meant the image respected `max-height` for height but didn't scale width proportionally since `width` was pinned.

**Tried:** setting only `width` + `aspect-ratio` in CSS, setting `height: auto`. Still didn't match the real photo's rendered size exactly.

### 3. Blur offset left / misaligned
The wrapper div (a block element) expanded to full width. The blur img was left-aligned while the real photo was centered.

**Tried:** `display: inline-grid; place-items: center` on the wrapper with `grid-area: 1/1` on both children to overlap them. This centred both elements but the blur canvas intrinsic sizing still didn't match the photo.

### 4. Vertical jump on load
The real photo used `display: none` until loaded, so the wrapper had 0 height during loading and jumped to full size on load.

**Tried:** switching to `opacity: 0 → 1` instead of `display: none`, keeping the photo always in layout flow.

### 5. Current state (still broken)
The wrapper uses `position: relative`, the blur img uses `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill`. The theory: the real photo drives layout dimensions, the blur stretches to fill that space absolutely.

In practice the sizing and positioning still isn't right — the blur and real photo don't overlap correctly.

## Root cause hypothesis

The core tension: the real photo's rendered size is determined by CSS constraints (`max-height: calc(100vh - 100px); max-width: calc(100vw - 100px); width: auto; height: auto`) applied to its HTML `width`/`height` attributes. The blur `<img>` (a 32px intrinsic image) needs to occupy that same exact rendered rectangle without knowing it ahead of time.

`position: absolute; width: 100%; height: 100%` only works if the parent has a known height — but the parent's height is determined by the real photo's rendered height, which is CSS-constrained. This creates a circular dependency.

## Possible paths forward

1. **Measure then paint**: After the real photo renders, read its `getBoundingClientRect()` and use those pixel values to size the blur absolutely. Requires a `ResizeObserver` or layout effect.

2. **CSS `aspect-ratio` on the wrapper**: Set `aspect-ratio: ${image.width} / ${image.height}` on the wrapper div, constrain the wrapper with `max-width`/`max-height`, and let both children fill it. Both the blur and real photo use `width: 100%; height: 100%`. The wrapper drives the size for both.

3. **Single `<canvas>` element**: Draw the BlurHash directly into a `<canvas>` that has the correct `width`/`height` attributes matching the photo. CSS constrains the canvas exactly as it would the photo (since canvas is inline-replaced like img). When the photo loads, swap `display` on canvas vs img. Avoids the two-element sizing problem but reintroduces the display-none jump unless handled carefully.

4. **Serve real thumbnails from R2**: The R2 worker hardcodes `thumbnailUrl = url` (no real thumbnails exist). If small JPEG thumbnails were generated at upload time, they'd be sized correctly by the browser with no decode step.

5. **CSS backdrop-filter + low-res img**: Load a tiny version of the image (e.g., 40px wide via a query param if the CDN supports it) as the placeholder — gets correct sizing for free since it's the same image.

## Files involved

- `src/components/GalleryImage.tsx` — main component, blur logic lives here
- `src/App.css` — `.galleryImage__media`, `.galleryImage__blur-canvas`, `.galleryImage__img--fade` classes
- `src/data/blurHashes.json` — 84 pre-generated hashes for default gallery
- `src/types.ts` — `blurHash?: string` on `GalleryImage`
- `src/views/PlaygroundView.tsx` + `PlaygroundView.css` — comparison playground at `/playground`
- `/tmp/blurhash-gen/gen-default.mjs` — hash generation script (not committed, needs to be re-run)
