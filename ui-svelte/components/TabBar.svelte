<script>
  import { section } from '../ui';
  import { Icon } from 'figma-plugin-ds-svelte';
  import IconSettings from '../icons/settings.svg';
  import IconTools from '../icons/tools.svg';
</script>

<div class="tabs">
  <span
    class="tab"
    tabNumber="1"
    on:click={() => section.set('selection')}
    class:active={$section === 'selection'}>Selection</span
  >
  <span
    class="tab"
    tabNumber="2"
    on:click={() => section.set('tokens')}
    class:active={$section === 'tokens'}>Tokens</span
  >

  <!-- <span
    class="tab"
    tabNumber="2"
    on:click={() => section.set('theme')}
    class:active={$section === 'settings'}
  >
    <Icon iconName={IconSettings} class="icon" />
  </span> -->

  <span
    class="tab"
    style="margin-left: auto;"
    tabNumber="2"
    on:click={() => section.set('settings')}
    class:active={$section === 'settings'}
  >
    <Icon iconName={IconSettings} class="icon" />
  </span>
</div>

<style>
  .tabs {
    display: flex;
    align-items: center;
    gap: var(--size-xsmall);

    height: 41px;
    box-shadow: 0px 1px 0px var(--figma-color-border);

    padding-left: var(--size-xsmall);
    padding-right: var(--size-xxxsmall);
  }
  .tab {
    font-family: var(--font-stack);
    font-size: var(--font-size-xsmall);
    line-height: var(--font-line-height);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--font-letter-spacing-pos-small);
    color: var(--figma-color-text-secondary);
    /* fill: var(--figma-color-text-secondary); */
    cursor: default;
    user-select: none;
  }
  .tab :global(.icon) {
    color: inherit !important;
    fill: none !important;
  }
  .tab :global(.icon svg) {
    width: 16px;
    height: 16px;
  }
  .tab:hover {
    color: var(--figma-color-text);
    /* fill: var(--figma-color-text); */
  }
  .active {
    color: var(--figma-color-text);
    /* fill: var(--figma-color-text); */
  }
</style>
