## Why

The public viewer gates albums **binary**: `AlbumList.tsx` forces login before showing the
list, and the token (when present) makes the Worker return everything. There is no notion
of *tiers* — a logged-in friend can't see a curated `friend` subset distinct from what the
owner sees, and anonymous visitors are pushed to log in even for public albums. Under the
new Auth0 RBAC + two-axis `audience`/`listed` model, the viewer's only job is to **send the
token** so the Worker can widen the list/album responses to the caller's tier — while the
anonymous public path stays exactly as it is.

This is the textsite slice of the coordinated `add-album-rbac` rollout. It **depends on**
the Worker enforcing `canList`/`canAccess` by role (defined in
`textsite-r2-worker/openspec/changes/add-album-rbac`). The viewer holds no authorization
logic; it forwards the token and renders what the Worker returns.

## What Changes

- Stop forcing login to view the album list. Anonymous visitors see public, listed albums
  exactly as today (unchanged, edge-cacheable). Sign-in becomes **optional and additive**.
- When a user is logged in, send `Authorization: Bearer <token>` on `/api/albums` and
  `/api/albums/:id` (the plumbing already exists via `fetchR2Albums(token?)` /
  `fetchR2Album(..., token?)`) so the Worker returns their tier — friends now see
  `friend`-audience albums in the **list**, not just by direct URL.
- Provide a lightweight, optional sign-in/sign-out affordance so friends/family can opt in;
  anonymous remains the default with no friction.
- Preserve the cache split: anonymous responses cached; authed (per-tier) responses bypass
  the local cache so one tier's list is never served to another.

## Capabilities

### New Capabilities
- `viewer-tiered-albums`: optional sign-in that forwards the Auth0 token on read requests so
  logged-in callers see their role's tier in list and album views, while the anonymous
  public path is unchanged and remains cacheable.

### Modified Capabilities
<!-- None — no pre-existing openspec specs in this repo. -->

## Impact

- **Code**: `src/components/AlbumList.tsx` (remove forced `loginWithRedirect`; render
  anonymous list; optional sign-in control), `src/services/r2.ts` (already token-aware —
  verify cache split and that the token is sent when available), and wherever the album
  list is mounted.
- **Depends on**: the Worker returning role-tiered results. No Auth0 config changes beyond
  what the Worker change defines (textsite already sets `audience` in `main.tsx`).
- **Behavior**: friends see their tier only after login + token refresh; anonymous UX is
  unchanged. No new dependencies.
- **Tests**: `jest` — anonymous list renders without login; token is attached when
  authenticated; authed responses skip the anonymous cache.
