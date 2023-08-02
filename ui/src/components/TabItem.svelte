<script>
  export let activate;
  export let active = false;
</script>

<span class="tab" on:click={activate} class:active {...$$props}>
  <slot />
</span>

<style>
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
