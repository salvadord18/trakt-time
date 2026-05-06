---
trigger: glob
globs: 'projects/client/src/**/*.{svelte,scss,css,ts}'
description: 'Design tokens, theme variables, shared component classes, and the Svelte CSS scoping rules to keep them honest.'
applyTo: 'projects/client/src/**/*.{svelte,scss,css,ts}'
---

# Theming Guidelines

The trakt-time UI must look correct across **dark, light, and `system`**
themes. The way we keep that promise is by routing every visual decision
through a small set of CSS custom properties declared in
`src/style/overrides.css`. Components consume tokens; tokens decide what
maps to which palette swatch.

## Token-first rule

> **Components must never reference palette swatches (`var(--shade-*)`,
> `var(--purple-*)`, raw hex values, etc.) directly for colors that
> should change with the theme.**

If a value needs to swap between themes, declare a new token in
`overrides.css` and consume it from the component. If a value is
intentionally theme-invariant (e.g. text laid over poster art), still
route it through a `:root`-level token so future readers know it was
deliberate.

```scss
/* Bad — pill text is hardcoded; light/dark themes can't override */
.show-title-pill {
  background-color: var(--shade-800);
  color: var(--shade-300);
}

/* Good — pill text follows whichever theme is active */
.show-title-pill {
  background-color: var(--trakttime-tag-background);
  color: var(--trakttime-tag-foreground);
}
```

The relevant tokens for the most-touched surfaces:

| Surface              | Token                                 |
| -------------------- | ------------------------------------- |
| Page background      | `--color-background`                  |
| Card / sheet bg      | `--color-card-background`             |
| Floating overlay bg  | `--color-floating-background`         |
| Border               | `--color-border`                      |
| Body text            | `--color-text-primary`                |
| Muted text           | `--color-text-secondary`              |
| Accent (purple)      | `--trakttime-accent`                  |
| Pill / chip bg       | `--trakttime-tag-background`          |
| Pill / chip text     | `--trakttime-tag-foreground`          |
| Navbar blur fill     | `--trakttime-navbar-blur-bg`          |
| Overlay-on-poster fg | `--trakttime-overlay-text-primary`    |
| Overlay-on-poster fg | `--trakttime-overlay-text-secondary`  |

The dimensional and increment tokens (`--trakttime-max-width`,
`--ni-*`, `--gap-*`, `--border-radius-*`) are also non-negotiable. Avoid
literal `px` / `rem` whenever a token covers it.

## Shared component classes live in `src/style/components.css`

Multiple components rendering the same visual concept (pill, divider,
overlay, etc.) must consume a **single** class definition, not three
near-identical `:global(...)` blocks. The pill regression we hit (the
`shade-300` / `shade-800` ghost values that ignored the tokens) was a
direct consequence of three different svelte components defining
`:global(.show-title-pill)` independently.

The canonical home for cross-component class definitions is
`projects/client/src/style/components.css`. It is imported once from
`src/style/index.ts` and inherits `overrides.css` tokens automatically.

```css
/* src/style/components.css */
.show-title-pill {
  background-color: var(--trakttime-tag-background);
  color: var(--trakttime-tag-foreground);
  /* …everything that used to live three times… */
}
```

Components then just apply the class — no `<style>` block needed for
the shared visuals.

## Skeleton + scrollable-row mixins

`src/style/scss/mixins/index.scss` exposes two mixins that should be
preferred over inlining the patterns:

```scss
@use '$style/scss/mixins/index' as *;

/* shimmer placeholder — uses --color-card-background + --color-border */
.poster-skeleton-img {
  @include shimmer-bg;
}

/* horizontal poster row — display:flex + scrollbar-hidden */
.poster-row {
  @include scrollable-row;          // default gap = var(--gap-s)
  padding: 0 var(--gap-m);
}

.cast-row {
  @include scrollable-row(var(--gap-m));  // override gap
}
```

The `@keyframes shimmer` definition lives once in
`src/style/animations/index.css`. Don't redeclare it locally.

## Svelte's CSS scoping pierces inline `<svg>`, not child components

Svelte scopes selectors with a per-component class (`.svelte-xxxx`).
Descendant selectors targeting *bare* HTML elements work fine for
markup that lives in the same component:

```svelte
<button class="action-btn">
  <svg>…</svg>           ← .action-btn svg { … } MATCHES
</button>
```

But the moment you replace that inline SVG with a child component
(`<HeartIcon />`, `<ChevronRightIcon />`, etc.), Svelte's scoping no
longer reaches the SVG inside the child:

```svelte
<button class="action-btn">
  <HeartIcon />          ← .action-btn svg { … } DOES NOT MATCH
</button>
```

Two ways out, depending on whether the parent must support both shapes:

```scss
/* If the parent now only ever renders icon components */
.action-btn :global(svg) {
  width: var(--ni-14);
}

/* If the parent might still render bare svg in some branch */
.action-btn svg,
.action-btn :global(svg) {
  width: var(--ni-14);
}
```

When you swap an inline SVG for a component, audit any sibling
selectors that reach into `svg` and add `:global(...)`.

## Overlay text on poster art

Posters are usually dark and colorful, so text rendered on top of them
needs always-light values regardless of the active theme. Use the
`--trakttime-overlay-text-{primary,secondary}` tokens — they're declared
once at `:root` and never re-defined per theme. Don't reach for
`var(--shade-10)` / `var(--shade-300)` directly even though they happen
to resolve to the right values.

## Quick checklist

- [ ] No `var(--shade-N)` / `var(--purple-N)` / raw hex in a component
      style block — use a token from `overrides.css`.
- [ ] Cross-component visual concepts live as a single class in
      `src/style/components.css`, not duplicated `:global(...)` blocks.
- [ ] Skeleton / scrollable-row patterns use the `shimmer-bg` and
      `scrollable-row` mixins.
- [ ] When swapping an inline SVG for an icon component, parent
      selectors targeting `svg` updated to use `:global(svg)`.
- [ ] If the value is intentionally theme-invariant, still go through a
      `:root` token (e.g. `--trakttime-overlay-text-*`) so the choice
      reads as deliberate.
