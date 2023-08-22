<script lang="ts">
  export let variable: Variable;
</script>

<span class="pill">{variable.name}</span>

<style>
  .pill {
    color: var(--figma-color-text);
    background-color: var(--figma-color-bg-secondary);
    border-color: var(--figma-color-border);

    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    box-sizing: border-box;
    height: 20px;
    overflow: hidden;
    padding: 0 5px;
  }
</style>
