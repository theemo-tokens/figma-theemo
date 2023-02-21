<script>
  import { getColorAsCSS } from '../tokens';

  export let token;
</script>

<span class="token">
  {#if token.style.type === 'PAINT'}
    <span class="color-swatch" style="--value: {getColorAsCSS(token)}" />
  {/if}

  <span>{token.name}</span>
</span>

<style>
  .token {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-swatch {
    display: inline-block;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background: var(--value);
  }
</style>
