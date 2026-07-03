<script lang="ts">
  import Drawer from '$lib/components/drawer/Drawer.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaTrivia } from '$lib/requests/models/MediaTrivia.ts';
  import { fade } from 'svelte/transition';
  import TriviaCard from './TriviaCard.svelte';

  const {
    items,
    summary,
    onClose,
  }: {
    items: ReadonlyArray<MediaTrivia>;
    summary: ReadonlyArray<string>;
    onClose: () => void;
  } = $props();

  let isOpen = $state(false);

  // The API can serve a summary-only payload; fall back to summary facts.
  const facts = $derived<ReadonlyArray<Pick<MediaTrivia, 'key' | 'text' | 'isSpoiler'>>>(
    items.length > 0 ? items : summary.map((text, index) => ({
      key: `summary_${index}`,
      text,
      isSpoiler: false,
    })),
  );
</script>

<Drawer
  {onClose}
  onOpened={() => (isOpen = true)}
  title={m.list_title_trivia()}
  variant="vip"
  size="auto"
>
  {#if isOpen}
    <div class="trivia-drawer-list" transition:fade={{ duration: 150 }}>
      {#each facts as trivia (trivia.key)}
        <TriviaCard {trivia} />
      {/each}
    </div>
  {/if}
</Drawer>

<style lang="scss">
  .trivia-drawer-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }
</style>
