<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, footer, ...rest }: {
    children?: Snippet;
    footer?: Snippet;
    [key: string]: any;
  } = $props();

  const stackSpace = $derived(footer ? '0' : undefined);
</script>

<section {...rest} class="stack" class:with-footer={!!footer} style:--stack-space={stackSpace}>
  {@render children?.()}

  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</section>

<style>
  section {
    overflow: auto;
    padding: 16px;
    flex-grow: 1;
  }

  section > footer {
    padding: 4px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
  }

  section :global(p) {
    margin: 0;
  }

  .with-footer {
    padding: 0;
    --stack-space: 0;
  }

  .with-footer > :global(*):not(footer) {
    padding: 16px;
  }

  .with-footer > footer {
    margin-top: auto;
  }
</style>
