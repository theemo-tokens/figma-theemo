<script lang="ts">
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';
  import { findVariableFromAlias, findCollection } from './variables';
  import Mode from './Mode.svelte';
  import VariableName from './VariableName.svelte';

  export let style: StyleDescriptor;

  $: paintStyle = style.style as PaintStyle;
  $: alias = findVariableAlias(paintStyle);
  $: variable = alias && findVariableFromAlias(alias);
  $: collection = variable && findCollection(variable);

  function findVariableAlias(style: PaintStyle) {
    if (
      style.paints[0].type === 'SOLID' &&
      (style.paints[0] as SolidPaint).boundVariables['color'] &&
      (style.paints[0] as SolidPaint).boundVariables['color'].type ===
        'VARIABLE_ALIAS'
    ) {
      return (style.paints[0] as SolidPaint).boundVariables['color'];
    }
  }
</script>

{#if variable}
  <div class="stack" style="--stack-space: 16px;">
    <div class="stack" style="--stack-space: 4px;">
      <p class="description">Uses Variable</p>
      <div><VariableName {variable} /></div>
    </div>

    {#each collection.modes as mode}
      <Mode {mode} {variable} />
    {/each}
  </div>
{:else}
  <p>
    When you want to use transforms with this style. Please assign it to a
    variable and add an alias :)
  </p>
{/if}
