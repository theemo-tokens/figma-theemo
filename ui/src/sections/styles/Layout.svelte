<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';

  import List from '../../components/List.svelte';
  import Style from './Style.svelte';
  import { Text } from 'figma-ui3-kit-svelte';

  let { styles, children }: {
    styles: StyleDescriptor[];
    children?: Snippet<[{ style: StyleDescriptor }]>;
  } = $props();

  let style = $state<StyleDescriptor | undefined>(undefined);

  $effect(() => {
    if (style && styles && styles.indexOf(style) === -1) {
      // attempt finding by id
      style = styles.find((conf) => conf.id === style!.id);
    }
  });
</script>

<div class="layout">
  <List
    items={styles}
    selection={style}
    select={(selection: StyleDescriptor) => (style = selection)}
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
