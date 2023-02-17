<script>
  import { onDestroy } from 'svelte';
  import List from '../../components/List.svelte';
  import { colors } from '../../tokens';
  import Token from '../../components/Token.svelte';
  import { Type } from 'figma-plugin-ds-svelte';

  let tokens;
  let token;

  const unsubscribe = colors.subscribe((colorTokens) => {
    tokens = colorTokens;
  });

  onDestroy(unsubscribe);

  function selectToken(selection) {
    console.log(selection);
  }
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
      <Type color="black8">{token.style.name}</Type>
    {:else}
      Please select a token
    {/if}
  </div>
</div>

<style>
  .layout {
    display: flex;
    gap: 8px;
  }

  .layout :global([role='listbox']) {
    width: 30%;
  }

  .details {
  }
</style>
