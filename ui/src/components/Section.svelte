<script>
  export let stackSpace = $$slots.footer ? '0' : undefined;
</script>

<section
  {...$$props}
  class="stack"
  class:with-footer={$$slots.footer}
  style:--stack-space={stackSpace}
>
  <slot />

  {#if $$slots.footer}
    <footer>
      <slot name="footer" />
    </footer>
  {/if}
</section>

<style>
  section {
    overflow: auto;
    padding: 16px;
    flex-grow: 1;
  }

  section > footer {
    padding: 4px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
  }

  section :global(p) {
    margin: 0;
  }

  .with-footer {
    padding: 0;
    --stack-space: 0;
  }

  .with-footer > :global(*):not(footer) {
    padding: 16px;
  }

  .with-footer > footer {
    margin-top: auto;
  }
</style>
