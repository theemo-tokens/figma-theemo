<script>
  export let type = 'warning';
  export let mode = 'fill';
</script>

<div
  {...$$props}
  class="alert {$$props.class}"
  data-type={type}
  data-mode={mode}
>
  <slot />
</div>

<style>
  .alert {
    border: 2px solid #000;
    padding: var(--size-xxsmall);
  }

  .alert[data-type='warning'][data-mode='fill'] {
    border-color: var(--figma-color-bg-warning-tertiary);
    background-color: var(--figma-color-bg-warning-tertiary);
    color: var(--figma-color-text-onwarning);
  }

  .alert[data-type='warning'][data-mode='outline'] {
    border-color: var(--figma-color-border-onwarning);
    /* background-color: var(--figma-color-bg-warning); */
    color: var(--figma-color-text-warning);
  }

  .alert[data-type='danger'][data-mode='fill'] {
    border-color: var(--figma-color-bg-danger);
    background-color: var(--figma-color-bg-danger);
    color: var(--figma-color-text-ondanger);
  }

  .alert[data-type='danger'][data-mode='outline'] {
    border-color: var(--figma-color-border-ondanger);
    /* background-color: var(--figma-color-bg-danger); */
    color: var(--figma-color-text-danger);
  }
</style>
