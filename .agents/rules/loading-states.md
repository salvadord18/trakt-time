---
trigger: glob
globs: 'projects/client/src/**/*.{svelte,ts}'
description: 'Skeletons, empty states, and reserving space so async-loaded content does not jump.'
applyTo: 'projects/client/src/**/*.{svelte,ts}'
---

# Loading & Empty State Guidelines

The fastest way to make this app feel cheap is to let content jump
around as queries resolve. Every section that renders async data must
**reserve the same vertical footprint** for all three of its lifecycle
states: loading, empty, and populated.

## The three states must be the same height

For each row / section that loads data, branch deliberately on
`(loading, length===0, default)` and make sure the height stays
constant:

```svelte
{#if loading && items.length === 0}
  {@render skeletonRow('shows')}
{:else if items.length === 0}
  {@render emptyRow(m.text_empty_show_watchlist())}
{:else}
  <div class="poster-row" role="list">
    {#each items as item (item.key)}
      <PosterCard … />
    {/each}
  </div>
{/if}
```

If you only branch on `loading` and let the empty case fall through to
an empty `<div class="poster-row">`, the section collapses to its
header alone the moment the query resolves with zero items — and every
section below it lurches up.

## Skeletons must reserve text height too

`<PosterSkeleton>` renders **both** an image block (`aspect-ratio:
2/3`) **and** a text bar (`height: 1rem`) so the layout matches a real
`<PosterCard>` (which has a 0.7rem title with `line-height: 1rem`).

Don't roll your own poster skeleton — import the shared one from
`$lib/components/poster-card/PosterSkeleton.svelte`. If you need a
different shape (cast headshot, list-card row, …) follow the same
pattern: image block + text block, both using `@include shimmer-bg`.

The text block height must equal the rendered title's
`line-height`, not its `font-size`. We learned this the hard way —
skeletons with `height: 0.7rem` shifted the row by ~5–6px when the
real titles rendered with `line-height: 1rem`.

## Empty rows reserve `min-height`

Empty-state placeholders should match the populated row's footprint:

```scss
.poster-row-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  /* poster aspect 2:3 + title line-height + gap */
  min-height: calc(
    var(--trakttime-poster-card-width) * 1.5 + 1rem + var(--gap-xxs)
  );
  padding: 0 var(--gap-m);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
```

For list-style sections, reserve the height of the loading skeleton
explicitly:

```scss
.lists-empty {
  /* equals 3 list-card skeletons + 2 inter-card gaps */
  min-height: calc(var(--ni-40) * 3 + var(--gap-xs) * 2);
}
```

## Drilldowns must lead somewhere

A `>` chevron next to a section title is a contract: tapping it opens
*more*. Don't render a chevron on a section that:

- Already shows the entire dataset in place (e.g. Stats — the user can
  see all the numbers).
- Doesn't have a destination route (e.g. Favorites without a "view all
  favorites" page).

When a list is truncated (e.g. "5 most recent"), only render the
drilldown when there *is* more — `lists.length > LISTS_PREVIEW_COUNT`
— and link it to the all-items page (`/profile/me/lists`,
`/profile/[slug]/lists`, etc.).

When the drilldown destination doesn't exist for non-owners (no public
watchlist route, etc.), drop the chevron for that audience and keep
the section non-interactive — don't link to a 404.

## Reserve space for stats / counts even before data lands

Numeric tiles (`stats?.episodes.plays ?? 0`) render `0` by default
and update once the query resolves. That's fine — the cell width
doesn't change, just the value inside.

For composite values (e.g. "TV time": months/days/hours) where the
render is conditional on the data being present, render an em-dash
placeholder (`<span class="stat-placeholder">&mdash;</span>`) inside
the same flex container so the row keeps its height.

## Quick checklist

- [ ] Three render branches per async section: `loading`, `empty`,
      `populated`.
- [ ] Loading branch and empty branch both reserve the populated
      footprint (no sudden shrink).
- [ ] Skeletons reserve text-line height (not just image height).
- [ ] Drilldowns only on sections that genuinely have *more* and a
      destination.
- [ ] Numeric tiles default to `?? 0` so they don't flicker.
- [ ] Composite numeric values use a placeholder character inside the
      same container, not a hidden block.
