<script lang="ts">
  import Link from '$lib/components/link/Link.svelte';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import type { RecommendationSource } from '$lib/requests/models/RecommendationSource.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { source }: { source: RecommendationSource } = $props();

  const href = $derived(
    source.mediaType === 'show'
      ? UrlBuilder.show(source.media.slug)
      : UrlBuilder.movie(source.media.slug),
  );
</script>

<div class="trakt-recommendation-source-item">
  <Link {href} label={source.media.title}>
    <CrossOriginImage
      src={source.media.poster.url.thumb}
      alt={source.media.title}
    />
  </Link>
</div>

<style lang="scss">
  .trakt-recommendation-source-item {
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-m);
    overflow: hidden;

    :global(a) {
      display: block;
      width: 100%;
      height: 100%;
    }

    :global(img) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
</style>
