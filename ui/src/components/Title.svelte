<script>
  let { children, ...rest } = $props();
</script>

<p {...rest} data-title>
  {@render children()}
</p>

<style>
  p {
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-22);
    color: var(--figma-color-text);
    margin: 0;
    width: 100%;
    display: flex;
    align-items: center;
    cursor: default;
    user-select: none;
  }
</style>
