# textsite — Project Context

## Purpose
The **public** photo viewer — a React SPA where visitors browse Matthew's albums. It reads
all album/image data through the **textsite-r2-worker** API. Anonymous visitors see public
albums; logged-in friends/family will see the additional tiers their role grants. This app
holds **no** authorization logic of its own — it sends whatever token it has and renders
whatever the Worker returns.

## Defining constraint (make-or-break)
The **anonymous read path must stay unchanged and fully public** — no forced login to view
public albums, and anonymous responses remain edge-cacheable. Sign-in is purely additive:
a logged-in caller sends a token so the Worker can widen what it returns. The viewer never
decides access; it only forwards the token.

## Current state
- `main.tsx` wraps the app in `Auth0Provider` (`@auth0/auth0-react`) with an `audience`, so
  `getAccessTokenSilently()` returns a real JWT (not an opaque token).
- `AlbumList.tsx` currently forces login (`loginWithRedirect`) before showing the album
  list — a display-only convenience; the Worker is the real gate.
- `services/r2.ts` sends `Authorization: Bearer <token>` on `/api/albums` and
  `/api/albums/:id` when a token exists, anonymous otherwise. Anonymous responses are
  cached; authed responses bypass the local cache (`fetchR2Albums(token?)`,
  `fetchR2Album(..., token?)`).

## Tech stack
- React + Vite + TypeScript. Tests via `jest`.
- Auth: `@auth0/auth0-react`. Config (`getConfig()`) from env: `domain`, `clientId`,
  `audience`, `redirectUri`. Same Auth0 tenant as `gallery-manager`, separate client.

## Conventions
- All data comes from the Worker; the SPA caches anonymous responses and skips the cache
  for authed responses (per-tier results must not be cross-served).
- Breadcrumb/UX gating only — the Worker enforces real access.
- `audience` must match the Worker's `AUTH0_AUDIENCE` so the token is a verifiable JWT.

## Source design docs (in textsite-r2-worker)
- `textsite-r2-worker/docs/access-model.md` — two-axis `audience` + `listed` model; the
  viewer's job is to send the token so friends see their tier in the list.
- `textsite-r2-worker/docs/rbac-fga-spike.md` — Auth0 RBAC mechanism decision.
