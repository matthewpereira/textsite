## Context

textsite is the public viewer. Today `AlbumList.tsx` forces `loginWithRedirect` before
showing the list, and `services/r2.ts` already sends the token when present
(`fetchR2Albums(token?)`, `fetchR2Album(..., token?)`). Under `add-album-rbac` the Worker
returns role-tiered results, so the viewer's only job is to **send the token when the user is
logged in** and stop forcing login for the public list. The viewer holds no authorization
logic; it forwards the token and renders what the Worker returns.

## Goals / Non-Goals

**Goals:**
- Anonymous visitors browse public, listed albums with no login (restores/keeps the fully
  public path).
- Logged-in friends/family see their tier in the list and album views (token forwarded).
- Preserve the cache split: anonymous cacheable, authed per-tier not shared.

**Non-Goals:**
- Any client-side access decision (the Worker decides).
- New Auth0 config (the viewer already sets `audience` in `main.tsx`).
- Account/role management UI.

## Decisions

### D1 — Make sign-in optional and additive; stop forcing login for the list
Remove the forced `loginWithRedirect` from the album-list path so anonymous users see the
public list immediately. Add an optional sign-in/sign-out affordance. When a user is logged
in, the existing token-forwarding path widens the results.
*Alternative:* keep forced login — rejected (breaks the public site and anonymous caching;
contradicts the spike's "anonymous path unchanged").

### D2 — Forward the token on reads; rely on the existing cache split
On `/api/albums` and `/api/albums/:id`, send `Authorization: Bearer <token>` when a token is
available (already implemented). Anonymous responses use the local cache; authed (per-tier)
responses bypass it so one tier's list is never served to another.
*Alternative:* a single cache keyed by tier client-side — rejected (the Worker already sets
`private, no-store` on authed responses; client mirrors by skipping the anonymous cache).

## Risks / Trade-offs

- **Friend sees their tier only after login + token refresh** → expected; document it.
- **Cache bleed if authed responses were cached** → mitigation: keep the authed path out of
  the anonymous cache (already the case); add a test.
- **Order-of-rollout** → if this ships before the Worker filters by role, a friend's token
  hits the legacy "authed ⇒ everything" path. Mitigation: land after the Worker change is
  live (stated in the proposal).

## Open Questions

- Should the viewer show a subtle "logged in as <tier>" indicator so a friend understands why
  they see more than an anonymous visitor? (Nice-to-have.)
