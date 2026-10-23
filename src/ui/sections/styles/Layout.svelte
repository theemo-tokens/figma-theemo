<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { StyleDescriptor } from '@core/styles/index';

  import List from '../../components/List.svelte';
  import Style from './Style.svelte';
  import { Text } from 'figma-ui3-kit-svelte';

  let { styles, children }: {
    styles: StyleDescriptor[];
    children?: Snippet<[{ style: StyleDescriptor }]>;
  } = $props();

  let selectedId = $state<string | undefined>(undefined);

  // selection tracked by id: survives store updates that replace objects
  let style = $derived(styles.find((s) => s.id === selectedId));
</script>

<div class="layout">
  <List
    items={styles}
    isSelected={(item: StyleDescriptor) => item.id === selectedId}
    select={(item: StyleDescriptor) => (selectedId = item.id)}
  >
    {#snippet children({ item })}
      <Style style={item} />
    {/snippet}
  </List>

  <div>
    {#if style}
      <Text variant="body-large" class="name"><Style {style} /></Text>
      {@render children?.({ style })}
    {:else}
      Please select a token
    {/if}
  </div>
</div>

<style>
  .layout {
    height: 100%;
    display: grid;
    grid-template-columns: 230px auto;
    gap: 8px;
  }

  :global(.name) {
    margin-bottom: 8px;
  }
</style>
