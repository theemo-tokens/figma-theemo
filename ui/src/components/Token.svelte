<script>
  import { getColorAsCSS } from '../tokens';

  export let token;
</script>

<span class="token">
  {#if token.style.type === 'PAINT'}
    <span class="color-swatch" style="--value: {getColorAsCSS(token)}" />
  {/if}

  <span>{token.style.name}</span>
</span>

<style>
  .token {
    display: flex;
    gap: 8px;
    padding: 4px;
  }

  .color-swatch {
    display: inline-block;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background: var(--value);
  }
</style>
