<script>
  export let tokens;

  import List from '../../components/List.svelte';
  import Token from '../../components/Token.svelte';
  import { Type } from 'figma-plugin-ds-svelte';

  let token;
</script>

<div class="layout">
  <List
    items={tokens}
    selection={token}
    select={(selection) => (token = selection)}
    let:item
  >
    <Token token={item} />
  </List>

  <div class="details">
    {#if token}
      <Type size="medium" weight="medium"><Token {token} /></Type>
      <slot {token} />
    {:else}
      Please select a token
    {/if}
  </div>
</div>

<style>
  .layout {
    height: 100%;
    display: flex;
    gap: 8px;
  }

  .layout :global([role='listbox']) {
    width: 240px;
  }

  .details {
  }
</style>
