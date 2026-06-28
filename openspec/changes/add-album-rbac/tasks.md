## 1. Prerequisites

- [ ] 1.1 Confirm the Worker filters reads by role (canList/canAccess) is live before shipping
- [ ] 1.2 Confirm the configured Auth0 `audience` equals the Worker's `AUTH0_AUDIENCE`

## 2. Public-by-default browsing

- [ ] 2.1 Remove the forced `loginWithRedirect` from `AlbumList.tsx`; render the anonymous public list
- [ ] 2.2 Add an optional sign-in / sign-out affordance (no friction for anonymous)

## 3. Tiered results via token forwarding

- [ ] 3.1 Verify `services/r2.ts` attaches the bearer token on `/api/albums` and `/api/albums/:id` when available; anonymous sends none
- [ ] 3.2 Keep authed (per-tier) responses out of the anonymous cache
- [ ] 3.3 Handle a Worker `404` on a denied album as a graceful not-found (no login loop / crash)

## 4. Tests (jest)

- [ ] 4.1 Anonymous album list renders without any login redirect
- [ ] 4.2 Token attached when authenticated; absent when anonymous; friend list includes friend tier
- [ ] 4.3 Authed response bypasses the anonymous cache; denied album shows not-found
