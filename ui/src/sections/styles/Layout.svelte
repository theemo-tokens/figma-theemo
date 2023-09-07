<script lang="ts">
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';

  export let styles;

  import List from '../../components/List.svelte';
  import Style from './Style.svelte';
  import { Type } from 'figma-plugin-ds-svelte';

  let style: StyleDescriptor;

  $: {
    if (style && styles && styles.indexOf(style) === -1) {
      // attempt finding by id
      style = styles.find((conf) => conf.id === style.id);
    }
  }
</script>

<div class="layout">
  <List
    items={styles}
    selection={style}
    select={(selection) => (style = selection)}
    let:item
  >
    <Style style={item} />
  </List>

  <div>
    {#if style}
      <Type size="medium" weight="medium" class="name"><Style {style} /></Type>
      <slot {style} />
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
