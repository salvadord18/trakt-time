<script lang="ts">
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaType } from '$lib/requests/models/MediaType.ts';
  import { movieSentimentQuery } from '$lib/requests/queries/movies/movieSentimentQuery.ts';
  import { showSentimentQuery } from '$lib/requests/queries/shows/showSentimentQuery.ts';
  import SentimentDrawer from './_internal/SentimentDrawer.svelte';
  import SentimentSummaryCard from './_internal/SentimentSummaryCard.svelte';

  const { type, slug }: { type: MediaType; slug: string } = $props();

  let drawerOpen = $state(false);
  $effect(() => {
    slug;
    drawerOpen = false;
  });

  const query = $derived(
    useQuery(
      type === 'movie'
        ? movieSentimentQuery({ slug, enabled: true })
        : showSentimentQuery({ slug, enabled: true }),
    ),
  );
  const sentiment = $derived($query.data ?? null);
</script>

{#if sentiment}
  <section class="summary-section">
    <h2 class="summary-section-title">{m.header_community_sentiment()}</h2>
    <SentimentSummaryCard {sentiment} onclick={() => (drawerOpen = true)} />
  </section>

  {#if drawerOpen}
    <SentimentDrawer {sentiment} onClose={() => (drawerOpen = false)} />
  {/if}
{/if}
