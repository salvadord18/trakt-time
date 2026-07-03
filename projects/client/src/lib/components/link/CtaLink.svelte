<script lang="ts">
  const { href, children }: ChildrenProps & { href: string } = $props();
</script>

<a {href} class="cta-link">
  {@render children()}
</a>

<style>
  .cta-link {
    color: var(--trakttime-accent);
    text-decoration: none;
    font-weight: 600;
  }
</style>
