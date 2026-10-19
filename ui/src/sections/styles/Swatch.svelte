<script lang="ts">
  import { getColorAsCSS } from './data';

  let { style }: { style: PaintStyle } = $props();
</script>

<span class="color-swatch" style="--value: {getColorAsCSS(style)}"></span>

<style>
  .color-swatch {
    display: inline-block;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background: var(--value);
  }
</style>
