<script lang="ts">
  import { Chit, VariablePill } from 'figma-ui3-kit-svelte';
  import { getVariableConfig, hasReference } from './data';
  import {
    findColorForVariable,
    findVariableById,
    findVariableFromAlias,
    getValue,
    isAlias
  } from './variables';

  let { variable, mode = undefined }: {
    variable: Variable;
    mode?: string;
  } = $props();

  const reference = $derived(hasReference(variable, mode));
  const value = $derived(getValue(variable, mode));
  const config = $derived(getVariableConfig(variable, mode));
  const color = $derived(
    reference
      ? findColorForVariable(findVariableById(config!.referenceId)!)
      : findColorForVariable(variable, mode)
  );
</script>

<span class="variable">
  <Chit color={color} shape={isAlias(value) || reference ? "square" : "circle"}/>
  
  {#if isAlias(value)}
    <VariablePill label={findVariableFromAlias(value)!.name} />
  {:else if reference}
    <VariablePill label={findVariableById(config!.referenceId)!.name} />
  {:else}
    {color}
  {/if}
</span>

<style>
  .variable {
    font-variant-numeric: tabular-nums;
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
</style>
