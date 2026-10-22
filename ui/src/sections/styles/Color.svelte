<script lang="ts">
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';
  import { findVariableFromAlias, findCollection } from './variables';
  import Mode from './Mode.svelte';
  import { VariablePill } from 'figma-ui3-kit-svelte';

  let { style }: { style: StyleDescriptor } = $props();

  const paintStyle = $derived(style.style as PaintStyle);
  const alias = $derived(findVariableAlias(paintStyle));
  const variable = $derived(alias && findVariableFromAlias(alias));
  const collection = $derived(variable ? findCollection(variable) : undefined);

  function findVariableAlias(style: PaintStyle) {
    const bound = (style.paints[0] as SolidPaint).boundVariables?.['color'];

    if (style.paints[0].type === 'SOLID' && bound?.type === 'VARIABLE_ALIAS') {
      return bound;
    }
  }
</script>

{#if variable && collection}
  <div class="stack" style="--stack-space: 16px;">
    <div class="stack" style="--stack-space: 4px;">
      <p class="description">Uses Variable</p>
      <div><VariablePill label={variable.name} /></div>
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
