---
trigger: glob
globs: 'projects/client/**'
description: 'Cross-domain hazards (cookies, OAuth redirects), v3 vs public Trakt endpoints, and how the Cloudflare Worker is wired together.'
applyTo: 'projects/client/**'
---

# Infrastructure & Cross-Domain Guidelines

The trakt-time worker runs on whatever origin Cloudflare assigns it
(`trakt-time.<account>.workers.dev` or a custom domain). Anything in
the codebase that hard-codes the upstream `trakt.tv` host silently
breaks for our deploy. The rules below exist because we hit each one
of these footguns.

## Never pin cookies to a parent domain you don't own

The upstream codebase set the consent cookie with `domain: '.trakt.tv'`.
When the worker runs anywhere else, browsers refuse the `Set-Cookie`
header and the consent banner reappears on every reload. **Don't set
`domain` unless you're certain the deployment serves under that
domain.** Defaulting (no `domain` attribute) scopes the cookie to the
response origin, which is what we want.

```ts
'Set-Cookie': event.cookies.serialize(
  COOKIE_CONSENT_COOKIE_NAME,
  JSON.stringify(value),
  {
    httpOnly: false,
    secure: IS_PROD,
    maxAge: time.months(6) / time.seconds(1),
    path: '/',
    /* No `domain` — sticks to the deploy origin, works for every host. */
  },
),
```

## OAuth redirect URI uses the runtime origin

`getReferrer()` in `lib/utils/requests/getReferrer.ts` is the source
of truth for the OAuth `redirect_uri`. Production must fall back to
`globalThis.location?.origin` (not a hard-coded `https://app.trakt.tv`)
so the OAuth provider bounces users back to the deployed worker.

The `redirect_uri` must also be listed in the Trakt application's
allowed redirect URIs at <https://trakt.tv/oauth/applications>. When
adding a new deploy origin or custom domain, register both
`<origin>` and `<origin>/callback` in *Redirect URIs* and *Javascript
(cors) origins*. Keep `localhost:5173` and `localhost:4173` entries
for dev / preview.

## Sitemap and PWA manifest derive their origin too

- `src/routes/sitemap.xml/+server.ts` reads `url.origin` from the
  request handler — never hardcode the host.
- `src/lib/pwa/manifest.ts` should not declare `scope_extensions` for
  domains the worker can't actually serve. If you add cross-domain
  scope claims, you're claiming PWA ownership of those origins.

## /v3/ endpoints are /me-only optimizations

The fork hits a small set of `/v3/...` Trakt endpoints
(`/v3/users/me/lists`, `/v3/movies/:slug/me/lists`,
`/v3/shows/:slug/me/lists`). These are an **internal optimization
layer for the authenticated user only** — they don't accept arbitrary
slugs.

When a feature needs the same data for a non-self user (e.g. another
profile's lists), do **not** parameterize the `/v3/` path with that
slug. Instead, fall back to the typed `@trakt/api` contract that
hits the public route:

```ts
// /me only — uses the v3 optimization
userListsQuery()              // hits /v3/users/me/lists

// any user — uses the public typed contract
personalListsQuery({ slug })  // hits users.lists.personal({ params: { id: slug } })
```

`ProfileContent.svelte` picks between them based on `isOwner`. Treat
the same pattern as the canonical example for any future me-vs-public
split.

## Cloudflare Worker secrets and bindings

The worker needs three runtime secrets, set via `wrangler secret put`
from `projects/client`:

- `TRAKT_CLIENT_ID`
- `TRAKT_CLIENT_SECRET`
- `TYPESENSE_CLIENT_KEY`

Plus three GitHub Actions secrets for CI:

- `TRAKT_CLIENT_ID` — baked into the bundle at build time.
- `CLOUDFLARE_API_TOKEN` — from the Cloudflare dashboard, *Edit
  Cloudflare Workers* template scoped to your account.
- `CLOUDFLARE_ACCOUNT_ID` — from the dashboard URL.

The `TYPESENSE_SERVER` URL ships in `wrangler.jsonc` (`vars`), not as
a secret — override per environment if you stand up your own
Typesense instance. Worker bindings (`ASSETS`, `CF_VERSION_METADATA`)
are configured in `wrangler.jsonc` and need no extra setup.

## CLOUDFLARE_ACCOUNT_ID env var beats wrangler's OAuth account

Wrangler honors `CLOUDFLARE_ACCOUNT_ID` from the shell over whatever
account you're logged into. If your `.zsh*` exports it set to a
different account, every `wrangler` command tries to act on that
account, regardless of `wrangler whoami`. Symptom: `Authentication
error [code: 10000]` on a brand-new login.

Either match the env var to the account you're deploying to, or
`unset CLOUDFLARE_ACCOUNT_ID` for the session.

## Quick checklist

- [ ] No new code hard-codes `app.trakt.tv` / `trakt.tv` as a host.
- [ ] Cookies set without an explicit `domain` (or with one that
      provably matches the deploy origin).
- [ ] OAuth redirect URIs derived from `globalThis.location.origin`
      with the upstream URL only as an SSR fallback.
- [ ] New /v3/ endpoint? It's me-only by definition. Build a typed
      `@trakt/api` counterpart for non-self queries.
- [ ] Trakt app at <https://trakt.tv/oauth/applications> has every
      deploy origin's `/callback` and `/silent-redirect` registered.
- [ ] Worker secrets set via `wrangler secret put`, build-time
      secrets set in GitHub Actions.
