<script lang="ts">
  import { Input } from 'figma-plugin-ds-svelte';
  import VariablePill from './VariablePill.svelte';
  import { findCollection, getValue, isAlias } from './variables';
  import { hasReference, variables } from './data';
  import { messenger } from '../../infrastructure';
  import { CommandName } from '@theemo-figma/core/styles/commands';
  import type { VariableConfig } from '@theemo-figma/core/styles/index';

  export let mode: {
    modeId: string;
    name: string;
  };
  export let variable: Variable;

  $: collection = findCollection(variable);
  $: name = collection.modes.length > 1 ? mode.name : 'Value';
  $: value = getValue(variable, mode.modeId);

  $: transformsConfig = ($variables.find(
    (varConfig) =>
      varConfig.variableId === variable.id && varConfig.modeId === mode.modeId
  ) ?? {}) as VariableConfig;

  $: transforms = transformsConfig.transforms ?? {};

  // transforms
  $: hue = transforms.hue;
  $: saturation = transforms.saturation;
  $: lightness = transforms.lightness;
  $: opacity = transforms.opacity;

  function updateTransforms(prop: string) {
    return function (event: Event) {
      const value = (event.target as HTMLInputElement).value;
      const number = Number.parseInt(value, 10);

      // let transforms = style.data.transforms;

      // udpate
      if (number) {
        if (!transforms) {
          transforms = {};
        }

        transforms[prop] = number;
      }

      // delete
      else if (transforms && transforms[prop] !== undefined) {
        delete transforms[prop];
      }

      const transformsAvailable = Object.values(transforms).some(
        (val) => val !== undefined
      );
      if (transformsAvailable) {
        messenger.send(CommandName.SaveTransforms, {
          variableId: variable.id,
          modeId: mode.modeId,
          transforms
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
        on:change={updateTransforms('hue')}
        on:blur={updateTransforms('hue')}
        on:keydown={modifyTransform}
      />
      <Input
        placeholder="Saturation"
        value={saturation}
        on:change={updateTransforms('saturation')}
        on:blur={updateTransforms('saturation')}
        on:keydown={modifyTransform}
      />
      <Input
        placeholder="Lightness"
        value={lightness}
        on:change={updateTransforms('lightness')}
        on:blur={updateTransforms('lightness')}
        on:keydown={modifyTransform}
      />
      <Input
        placeholder="Opacity"
        value={opacity}
        on:change={updateTransforms('opacity')}
        on:blur={updateTransforms('opacity')}
        on:keydown={modifyTransform}
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
  }
</style>
