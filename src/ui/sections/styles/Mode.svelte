<script lang="ts">
  import { NumericInput } from 'figma-ui3-kit-svelte';
  import ColorVariable from './ColorVariable.svelte';
  import { findCollection, getValue, isAlias } from './variables';
  import { hasReference, variables } from './data';
  import { messenger } from '../../infrastructure';
  import { CommandName } from '@core/styles/commands';
  import type { VariableConfig } from '@core/styles/index';

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
    return function (value: number | null) {
      // clone, mutate – transforms are derived state
      const next = { ...transforms };

      // update
      if (value) {
        next[prop] = value;
      }
      // delete: NumericInput commits null when the field is emptied
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
</script>

<div class="stack">
  <p class="line">
    {name}
    <ColorVariable {variable} mode={mode.modeId} />
  </p>

  {#if isAlias(value) || hasReference(variable, mode.modeId)}
    <NumericInput
      placeholder="Opacity"
      value={opacity}
      onchange={updateTransforms('opacity')}
    />
    <div class="input-group">
      <NumericInput
        label="H"
        placeholder="Hue"
        value={hue}
        min={-360}
        max={360}
        onchange={updateTransforms('hue')}
      />
      <NumericInput
        label="S"
        placeholder="Saturation"
        value={saturation}
        min={-100}
        max={100}
        onchange={updateTransforms('saturation')}
      />
      <NumericInput
        label="L"
        placeholder="Lightness"
        value={lightness}
        min={-100}
        max={100}
        onchange={updateTransforms('lightness')}
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
    gap: 4px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
</style>
