<script lang="ts">
  import VariableName from './VariableName.svelte';
  import { getVariableConfig, hasReference } from './data';
  import {
    findColorForVariable,
    findVariableById,
    findVariableFromAlias,
    getValue,
    isAlias
  } from './variables';

  export let variable: Variable;
  export let mode: string | undefined = undefined;

  $: value = getValue(variable, mode);
  $: color = findColorForVariable(variable, mode);
  $: config = getVariableConfig(variable, mode);
</script>

<span class="variable">
  <span class="color-swatch" style="--value: {color}" />

  {#if isAlias(value)}
    <VariableName variable={findVariableFromAlias(value)} />
  {:else if hasReference(variable, mode)}
    <VariableName variable={findVariableById(config.referenceId)} />
  {:else}
    {color}
  {/if}
</span>

<style>
  .variable {
    font-variant-numeric: tabular-nums;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .color-swatch {
    display: inline-block;
    border-radius: 1px;
    width: 16px;
    height: 16px;
    background: var(--value);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px 1px inset;
  }
</style>
