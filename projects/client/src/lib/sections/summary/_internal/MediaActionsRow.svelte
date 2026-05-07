<script lang="ts">
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    watchedProps: MarkAsWatchedStoreProps;
    title: string;
    /** When provided, also renders a Rate / Favorite button that triggers it. */
    onRate?: () => void;
  };

  const { watchedProps, title, onRate }: Props = $props();
</script>

<div class="summary-actions-row">
  <WatchedRow {watchedProps} {title} />

  {#if onRate}
    <button
      type="button"
      class="summary-rate-btn"
      onclick={onRate}
      aria-label={m.header_rate_or_favorite()}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
      {m.button_text_rate_or_favorite()}
    </button>
  {/if}
</div>

<style lang="scss">
  .summary-actions-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--gap-s);
    margin-top: var(--gap-xxs);
  }

  .summary-rate-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    background: color-mix(in srgb, var(--trakttime-accent) 15%, transparent);
    border: var(--ni-1) solid
      color-mix(in srgb, var(--trakttime-accent) 40%, transparent);
    border-radius: var(--border-radius-s);
    color: var(--trakttime-accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: var(--gap-xxs) var(--gap-s);
    cursor: pointer;
    width: fit-content;
    -webkit-tap-highlight-color: transparent;

    svg {
      width: 0.9rem;
      height: 0.9rem;
    }
  }
</style>
