<script lang="ts">
  import { Icon, IconEffects } from 'figma-plugin-ds-svelte';
  import IconText from '../../assets/icons/text.svg';
  import { type StyleDescriptor } from '@theemo-figma/core/styles/index';
  import Swatch from './Swatch.svelte';

  export let style: StyleDescriptor;
</script>

<span class="style">
  {#if style.style.type === 'PAINT'}
    <Swatch style={style.style} />
  {:else if style.style.type === 'EFFECT'}
    <Icon iconName={IconEffects} class="style-icon style-effect-icon" />
  {:else if style.style.type === 'TEXT'}
    <Icon iconName={IconText} class="style-icon style-text-icon" />
  {/if}

  <span>{style.name}</span>
</span>

<style>
  .style {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  :global(.style-icon) {
    width: 16px !important;
    height: 16px !important;
  }

  :global(.style-effect-icon svg) {
    transform: scale(2);
  }

  :global(.style-text-icon svg) {
    fill: var(--figma-color-bg);
  }
</style>
