<script lang="ts">
  import { Input } from 'figma-ui3-kit-svelte';
  import VariablePill from './VariablePill.svelte';
  import { findCollection, getValue, isAlias } from './variables';
  import { hasReference, variables } from './data';
  import { messenger } from '../../infrastructure';
  import { CommandName } from '@theemo-figma/core/styles/commands';
  import type { VariableConfig } from '@theemo-figma/core/styles/index';

  let { mode, variable }: {
    mode: { modeId: string; name: string };
    variable: Variable;
  } = $props();

  const collection = $derived(findCollection(variable));
  const name = $derived(
    (collection?.modes.length ?? 1) > 1 ? mode.name : 'Value'
  );
  const value = $derived(getValue(variable, mode.modeId));

  const transformsConfig = $derived(
    ($variables.find(
      (varConfig) =>
        varConfig.variableId === variable.id && varConfig.modeId === mode.modeId
    ) ?? {}) as VariableConfig
  );

  const transforms = $derived(transformsConfig.transforms ?? {});

  // transforms
  const hue = $derived(transforms.hue);
  const saturation = $derived(transforms.saturation);
  const lightness = $derived(transforms.lightness);
  const opacity = $derived(transforms.opacity);

  function updateTransforms(prop: 'hue' | 'saturation' | 'lightness' | 'opacity') {
    return function (event: Event) {
      const number = Number.parseInt((event.target as HTMLInputElement).value, 10);

      // clone, mutate – transforms are derived state
      const next = { ...transforms };

      // update
      if (number) {
        next[prop] = number;
      }
      // delete
      else if (next[prop] !== undefined) {
        delete next[prop];
      }

      const transformsAvailable = Object.values(next).some(
        (val) => val !== undefined
      );

      if (transformsAvailable) {
        messenger.send(CommandName.SaveTransforms, {
          variableId: variable.id,
          modeId: mode.modeId,
          transforms: next
        });
      } else {
        messenger.send(CommandName.DeleteTransforms, {
          variableId: variable.id,
          modeId: mode.modeId
        });
      }
    };
  }

  function modifyTransform(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    const number = target.value ? Number.parseInt(target.value, 10) ?? 0 : 0;

    if (e.code === 'ArrowUp') {
      target.value = `${number + 1}`;
      e.preventDefault();
    }
    if (e.code === 'ArrowDown') {
      target.value = `${number - 1}`;
      e.preventDefault();
    }
  }
</script>

<div class="stack">
  <p class="line">
    {name}
    <VariablePill {variable} mode={mode.modeId} />
  </p>

  {#if isAlias(value) || hasReference(variable, mode.modeId)}
    <div class="input-group">
      <Input
        placeholder="Hue"
        value={hue}
        onchange={updateTransforms('hue')}
        onblur={updateTransforms('hue')}
        onkeydown={modifyTransform}
      />
      <Input
        placeholder="Saturation"
        value={saturation}
        onchange={updateTransforms('saturation')}
        onblur={updateTransforms('saturation')}
        onkeydown={modifyTransform}
      />
      <Input
        placeholder="Lightness"
        value={lightness}
        onchange={updateTransforms('lightness')}
        onblur={updateTransforms('lightness')}
        onkeydown={modifyTransform}
      />
      <Input
        placeholder="Opacity"
        value={opacity}
        onchange={updateTransforms('opacity')}
        onblur={updateTransforms('opacity')}
        onkeydown={modifyTransform}
      />
    </div>
  {/if}
</div>

<style>
  .line {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .input-group {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
</style>
