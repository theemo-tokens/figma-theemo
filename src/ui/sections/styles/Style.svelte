<script lang="ts">
  import type { StyleDescriptor } from '@core/styles/index';

  import { Icon, Chit } from 'figma-ui3-kit-svelte';
  import { IconTextSmall } from 'figma-ui3-kit-svelte/icons';
  import IconEffects from 'figma-ui3-kit-svelte/src/icons/24/icon.24.effects.small.svg';
  import { getColorAsCSS } from './data';

  let { style }: { style: StyleDescriptor } = $props();
</script>

<span class="style">
  {#if style.style.type === 'PAINT'}
    <Chit color={getColorAsCSS(style.style)} shape="circle"/>
  {:else if style.style.type === 'EFFECT'}
    <Icon iconName={IconEffects} size={16} class="style-icon" />
  {:else if style.style.type === 'TEXT'}
    <Icon iconName={IconTextSmall} size={16} class="style-icon" />
  {/if}

  <span>{style.name}</span>
</span>

<style>
  .style {
    display: flex;
    gap: 2px;
    align-items: center;
  }
</style>
