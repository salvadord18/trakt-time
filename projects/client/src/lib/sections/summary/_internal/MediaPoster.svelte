<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';

  type Props = {
    src: string;
    alt: string;
  };

  const { src, alt }: Props = $props();
</script>

<div class="summary-poster">
  <CrossOriginImage {src} {alt} classList="summary-poster-img" />
</div>

<style lang="scss">
  .summary-poster {
    flex-shrink: 0;
    width: var(--trakttime-poster-card-width);
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-m);
    overflow: hidden;
    box-shadow: 0 var(--ni-4) var(--ni-16) rgba(0, 0, 0, 0.4);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
</style>
