<script lang="ts">
  import { getColorAsCSS } from './data';

  export let style: PaintStyle;
</script>

<span class="color-swatch" style="--value: {getColorAsCSS(style)}" />

<style>
  .color-swatch {
    display: inline-block;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background: var(--value);
  }
</style>
