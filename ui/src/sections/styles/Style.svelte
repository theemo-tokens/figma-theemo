<script lang="ts">
  import { type StyleDescriptor } from '@theemo-figma/core/styles/index';
  import Swatch from './Swatch.svelte';

  export let style: StyleDescriptor;
</script>

<span class="style">
  {#if style.style.type === 'PAINT'}
    <Swatch style={style.style} />
  {/if}

  <span>{style.name}</span>
</span>

<style>
  .style {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
