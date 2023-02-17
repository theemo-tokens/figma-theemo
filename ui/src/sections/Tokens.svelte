<script>
  import Section from '../components/Section.svelte';
  import Colors from './tokens/Colors.svelte';
  import Effects from './tokens/Effects.svelte';
  import Numeric from './tokens/Numeric.svelte';
  import Strokes from './tokens/Strokes.svelte';
  import Text from './tokens/Text.svelte';

  let type = 'colors';
</script>

<div class="tabs">
  <span
    class="tab"
    tabNumber="1"
    on:click={() => (type = 'colors')}
    class:active={type === 'colors'}>Colors</span
  >

  <span
    class="tab"
    tabNumber="2"
    on:click={() => (type = 'effects')}
    class:active={type === 'effects'}
  >
    Effects
  </span>

  <span
    class="tab"
    tabNumber="2"
    on:click={() => (type = 'text')}
    class:active={type === 'text'}
  >
    Text
  </span>

  <span
    class="tab"
    tabNumber="2"
    on:click={() => (type = 'numeric')}
    class:active={type === 'numeric'}
  >
    Numeric
  </span>

  <span
    class="tab"
    tabNumber="2"
    on:click={() => (type = 'strokes')}
    class:active={type === 'strokes'}
  >
    Strokes
  </span>
</div>

<Section>
  {#if type === 'colors'}
    <Colors />
  {:else if type === 'effects'}
    <Effects />
  {:else if type === 'text'}
    <Text />
  {:else if type === 'numeric'}
    <Numeric />
  {:else if type === 'strokes'}
    <Strokes />
  {/if}
</Section>

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
