<script lang="ts">
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    watchedProps: MarkAsWatchedStoreProps;
    title: string;
    /** When provided, also renders a More-actions button that triggers it. */
    onMore?: () => void;
  };

  const { watchedProps, title, onMore }: Props = $props();
</script>

<div class="summary-actions-row">
  <WatchedRow {watchedProps} {title} />

  {#if onMore}
    <div class="summary-actions-divider" aria-hidden="true"></div>

    <div class="summary-more">
      <span class="summary-more-label">{m.button_text_more()}</span>
      <button
        type="button"
        class="summary-more-btn"
        onclick={onMore}
        aria-label={m.button_label_more_actions({ title })}
      >
        <MoreIcon />
      </button>
    </div>
  {/if}
</div>

<style lang="scss">
  .summary-actions-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--gap-m);
    margin-top: var(--gap-xxs);
  }

  /* A 1px line that visually breaks the watch toggle from the more-actions
     widget so they don't read as one chunky control. */
  .summary-actions-divider {
    width: 1px;
    height: var(--ni-20);
    background: var(--color-border);
  }

  .summary-more {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .summary-more-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .summary-more-btn {
    background: none;
    border: var(--ni-2) solid var(--color-border);
    border-radius: 50%;
    width: var(--ni-28);
    height: var(--ni-28);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0;
    transition:
      border-color var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }

    &:hover,
    &:focus-visible {
      border-color: var(--trakttime-accent);
      color: var(--trakttime-accent);
    }
  }
</style>
