## ADDED Requirements

### Requirement: Anonymous browsing requires no login
The viewer SHALL display the public album list and public albums to anonymous visitors
without forcing a login. The forced `loginWithRedirect` on the album-list path SHALL be
removed; anonymous responses remain cacheable.

#### Scenario: Anonymous visitor sees public albums
- **WHEN** a visitor with no session opens the album list
- **THEN** the public, listed albums render without any login redirect

### Requirement: Optional sign-in is additive
The viewer SHALL offer an optional sign-in/sign-out control and SHALL function fully for
anonymous users. Signing in MUST NOT change the anonymous experience for visitors who do not.

#### Scenario: Sign-in control present but not required
- **WHEN** an anonymous visitor browses the site
- **THEN** a sign-in affordance is available and browsing public content needs no account

### Requirement: Token forwarded on reads so tiers widen results
The viewer SHALL attach `Authorization: Bearer <token>` to `/api/albums` and
`/api/albums/:id` whenever a valid token is available, so the Worker returns the caller's
tier. Anonymous requests SHALL be sent without an Authorization header.

#### Scenario: Logged-in friend sees their tier in the list
- **WHEN** a user with the `friend` tier is logged in and loads the album list
- **THEN** the request carries the bearer token and the list includes `friend`-audience
  albums in addition to public ones

#### Scenario: Anonymous request carries no token
- **WHEN** an anonymous visitor loads the album list
- **THEN** the request is sent with no Authorization header

### Requirement: Authed responses are not served from the anonymous cache
The viewer SHALL keep authed (per-tier) responses out of the anonymous cache so one
principal's tiered results are never shown to another or to an anonymous visitor.

#### Scenario: Authed response bypasses the anonymous cache
- **WHEN** a logged-in user fetches albums and later an anonymous visitor fetches albums
- **THEN** the anonymous visitor receives the public response, never the cached authed result

### Requirement: Token requested for the Worker API audience
The viewer SHALL request its Auth0 access token for the Worker's API audience (the configured
`audience`, equal to the Worker's `AUTH0_AUDIENCE`) so that, when a friend logs in, the token
carries the `https://textsite/roles` claim the Worker needs to widen results. This audience is
already configured in `main.tsx`; the requirement pins it so it is not dropped.

#### Scenario: Friend token carries the roles claim
- **WHEN** a friend logs in and the viewer requests an access token
- **THEN** the token is issued for the Worker's API audience and carries
  `https://textsite/roles`

### Requirement: Albums outside a caller's tier resolve as not-found, not an error loop
The viewer SHALL render a graceful not-found state when the Worker returns `404` for an album
the caller cannot access (the Worker denies reads with 404, no existence leak), for both
anonymous and logged-in callers, without triggering a login loop or an error crash.

#### Scenario: Logged-in friend opens a family-only album URL
- **WHEN** a logged-in `friend` navigates directly to a `family`-only album URL and the Worker
  responds `404`
- **THEN** the viewer shows a not-found state and does not loop to login or crash
