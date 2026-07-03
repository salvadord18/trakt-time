<script lang="ts">
  import SparkleIcon from '$lib/components/icons/SparkleIcon.svelte';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import RecommendationSourcesDrawer from './RecommendationSourcesDrawer.svelte';
  import type { RecommendedEntry } from './useRecommendedList.ts';

  const { media }: { media: RecommendedEntry } = $props();

  let isSourcesDrawerOpen = $state(false);

  const href = $derived(
    media.type === 'show'
      ? UrlBuilder.show(media.slug)
      : UrlBuilder.movie(media.slug),
  );
</script>

<div class="recommended-poster-card">
  <PosterCard
    type={media.type}
    {href}
    id={media.id}
    title={media.title}
    posterUrl={media.poster.url.thumb}
  />

  {#if media.sources.length > 0}
    <button
      class="why-this-button"
      onclick={() => (isSourcesDrawerOpen = true)}
    >
      <SparkleIcon />
      {m.button_text_view_recommendation_sources()}
    </button>
  {/if}
</div>

{#if isSourcesDrawerOpen}
  <RecommendationSourcesDrawer
    sources={media.sources}
    title={media.title}
    onClose={() => (isSourcesDrawerOpen = false)}
  />
{/if}

<style lang="scss">
  .recommended-poster-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .why-this-button {
    display: flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: 0.7rem;
    line-height: 1rem;

    &:hover {
      color: var(--color-text-primary);
    }

    :global(svg) {
      width: var(--ni-12);
      height: var(--ni-12);
      flex-shrink: 0;
    }
  }
</style>
