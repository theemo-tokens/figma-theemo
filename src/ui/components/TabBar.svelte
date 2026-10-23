<script>
  let { children } = $props();
</script>

<div class="tabs">
  {@render children()}
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
