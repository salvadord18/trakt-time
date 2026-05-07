<script lang="ts">
  type Props = {
    label: string;
    extraLabel?: string | null;
  };

  const { label, extraLabel }: Props = $props();
</script>

<div class="summary-rating">
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    class="summary-rating-icon"
    aria-hidden="true"
  >
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
  <span>{label}</span>
  {#if extraLabel}
    <span class="summary-rating-extra">{extraLabel}</span>
  {/if}
</div>

<style lang="scss">
  .summary-rating {
    display: flex;
    align-items: center;
    gap: var(--gap-xxs);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--trakttime-accent);
  }

  .summary-rating-icon {
    width: var(--ni-14);
    height: var(--ni-14);
    color: var(--trakttime-accent);
  }

  .summary-rating-extra {
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-left: var(--gap-xs);
  }
</style>
