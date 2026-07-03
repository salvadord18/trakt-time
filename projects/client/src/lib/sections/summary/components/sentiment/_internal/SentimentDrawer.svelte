<script lang="ts">
  import Drawer from '$lib/components/drawer/Drawer.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { SentimentAnalysis } from '$lib/requests/models/SentimentAnalysis.ts';
  import { fade } from 'svelte/transition';
  import SentimentContent from './SentimentContent.svelte';

  const {
    sentiment,
    onClose,
  }: {
    sentiment: SentimentAnalysis;
    onClose: () => void;
  } = $props();

  let isOpen = $state(false);
</script>

<Drawer
  {onClose}
  onOpened={() => (isOpen = true)}
  title={m.header_community_sentiment()}
  variant="vip"
  size="auto"
>
  {#if isOpen}
    <div transition:fade={{ duration: 150 }}>
      <SentimentContent {sentiment} />
    </div>
  {/if}
</Drawer>
