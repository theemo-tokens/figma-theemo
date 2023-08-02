<p {...$$props} data-title>
  <slot />
</p>

<style>
  p {
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-medium);
    /* letter-spacing: var(--font-letter-spacing-pos-xsmall); */
    line-height: var(--line-height);
    color: var(--figma-color-text);
    margin: 0;
    width: 100%;
    display: flex;
    align-items: center;
    cursor: default;
    user-select: none;
    /* padding: 0 calc(var(--size-xxsmall) / 2) 0 var(--size-xxsmall); */
  }
</style>
