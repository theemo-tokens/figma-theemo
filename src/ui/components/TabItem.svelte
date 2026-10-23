<script>
  let { activate, active = false, children, ...rest } = $props();
</script>

<span class="tab" class:active {...rest} onclick={activate}>
  {@render children()}
</span>

<style>
  .tab {
    font-family: var(--font-stack);
    font-size: var(--font-size-11);
    line-height: var(--line-height-16);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-pos-055);
    color: var(--figma-color-text-secondary);
    cursor: default;
    user-select: none;
  }

  .tab :global(.icon-component) {
    color: inherit !important;
  }

  .tab:hover {
    color: var(--figma-color-text);
  }

  .active {
    color: var(--figma-color-text);
  }
</style>
