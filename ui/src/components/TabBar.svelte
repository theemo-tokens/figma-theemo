<script>
  import { section } from '../ui';
  import { Icon } from 'figma-plugin-ds-svelte';
  import IconSettings from '../assets/icons/settings.svg';
  import IconTools from '../assets/icons/tools.svg';
</script>

<div class="tabs">
  <slot />
</div>

<style>
  .tabs {
    display: flex;
    align-items: center;
    gap: var(--size-xsmall);

    height: 41px;
    box-shadow: 0px 1px 0px var(--figma-color-border);

    padding-inline: var(--size-xsmall);
  }
</style>
