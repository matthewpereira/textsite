# WebP Conversion: Batch JPG → WebP for R2 Gallery

## Goal

Convert all ~20,829 JPEG/PNG gallery images stored in Cloudflare R2 to WebP, reducing CDN bandwidth and load times while maintaining high visual quality. Replace files in place (keeping local backups).

## Context

- **Bucket name**: `vault`
- **R2 S3-compatible endpoint**: `https://0fd750382971b4d0fb8d56277043f868.r2.cloudflarestorage.com`
- **S3 credentials**: `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are in `/Users/matthew/Developer/textsite-r2-worker/.dev.vars`
- **Worker API**: `https://textsite-r2-api.matthewpereira.workers.dev` (no auth needed for GET)

## R2 Structure

```
vault/
  albums/{albumId}/images/{imageId}.{ext}   ← the actual image file
  metadata/images/{imageId}.json             ← per-image metadata
  albums/{albumId}/metadata.json             ← album metadata (imageIds list, etc.)
  albums/index.json                          ← index of all albums
```

Image metadata JSON shape (`metadata/images/{imageId}.json`):
```json
{
  "id": "img_1767298260064_72dvpgxsm",
  "mimeType": "image/jpeg",
  "size": 123456,
  "width": 1470,
  "height": 980,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "albumId": "default",
  "animated": false,
  "title": "...",
  "description": "..."
}
```

The worker derives the image file extension from `mimeType` via:
```ts
{ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
```

And constructs the R2 key as `albums/{albumId}/images/{imageId}.{ext}`.

So updating `mimeType` to `'image/webp'` in the metadata JSON (and uploading the `.webp` file) is sufficient for the worker to serve the new format. No worker code changes needed.

## Quality Setting

Source JPEGs are encoded at quality 70. WebP's quality scale is not 1:1 with JPEG:
- WebP 82 ≈ JPEG 70 perceptually (matches source quality, not an upgrade)
- This typically yields 30–40% smaller files than the original JPEG

Use `sharp` with: `sharp(input).webp({ quality: 82 })`.

## Script Plan

Write `/tmp/webp-convert/convert.mjs` as an ES module Node.js script.

### Dependencies (install in script dir)
```
npm install @aws-sdk/client-s3 sharp
```

### Algorithm

```
1. Load credentials from textsite-r2-worker/.dev.vars
2. GET /api/albums → array of { id } for all albums
3. For each album, GET /api/albums/{albumId} → array of images
   (Each image has: id, type/mimeType, albumId)
4. Filter: keep only images where type is image/jpeg or image/png
   Skip: image/gif, image/webp, video/*, anything else
5. For each qualifying image (concurrency: 5):
   a. Derive source key: albums/{albumId}/images/{imageId}.{ext}
   b. Derive dest key:   albums/{albumId}/images/{imageId}.webp
   c. Download source bytes from R2 via S3 GetObjectCommand
   d. Save backup to: /tmp/webp-convert/backup/{albumId}/{imageId}.{ext}
      - If backup file already exists, skip download (resumable)
   e. Convert with sharp: .webp({ quality: 82 })
   f. Size sanity check: if webp size >= original size, log and skip replacement
   g. Upload WebP to R2 (dest key) with contentType: 'image/webp'
   h. Download metadata/images/{imageId}.json from R2
   i. Update: mimeType → 'image/webp', size → webp byte length, animated → false
   j. Upload updated metadata JSON back to R2
   k. Delete source key from R2
   l. Log: "✓ {imageId}: {originalSize}kb → {webpSize}kb ({pct}% reduction)"
6. At end, write failed.json with any image IDs that errored
```

### Flags
- `--dry-run`: steps a–f only (no upload, no delete, no metadata update). Logs what would happen.
- `--album {albumId}`: process only one album (for testing before full run)

### Error handling
- Wrap each image in try/catch; log error and push to `failed` array; continue
- Never delete original unless WebP upload AND metadata update both succeed
- Write `failed.json` at the end listing all errored image IDs for manual review

### Progress reporting
- Print running count: `[42/20829] Converting img_xxx...`
- Print summary at end: total processed, total skipped, total failed, total bytes saved

## Running It

```sh
cd /tmp/webp-convert
npm install @aws-sdk/client-s3 sharp
node convert.mjs --album default   # test on default gallery first (84 images)
# verify gallery looks correct at https://matthewpereira.com
node convert.mjs                   # full run (~20,829 images)
```

## Notes

- The worker caches metadata in-memory (clears on restart) and the frontend caches in sessionStorage (30 min). After conversion, a worker restart may be needed to clear the in-memory cache, or just wait for it to expire.
- GIFs are skipped. WebP supports animation but conversion is lossy and complex — handle separately if ever needed.
- The worker `animated` field is set to `true` for `image/webp` by default (line in uploadImage function). Override to `false` in the metadata update since these are static photos, not animated WebPs.
- ~20,829 images at ~5 concurrent workers: estimate 30–60 minutes for the full run depending on image sizes.
- Backups will be large. The default gallery (84 images) is a good first test to gauge file sizes before committing to a full local backup of 20k images.
