<script lang="ts">
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';
  import { SelectMenu, IconButton, IconBreak } from 'figma-plugin-ds-svelte';
  import { hackSelectOffset } from '../../ui';
  import { references } from './data';
  import { CommandName } from '@theemo-figma/core/styles/commands';
  import { messenger } from '../../infrastructure';

  export let style: StyleDescriptor;
  export let referenceStyles;

  $: style;

  $: suggestions = referenceStyles
    .filter((refStyle) => refStyle.id !== style.id)
    .map((refStyle) => ({ value: refStyle.id, label: refStyle.name }));
  $: foundReference = $references.find((ref) => ref.styleId === style.id);

  $: reference = foundReference
    ? suggestions.find(
        (refStyle) => refStyle.value === foundReference.referenceId
      )
    : undefined;

  function linkReference() {
    messenger.send(CommandName.LinkReference, {
      styleId: style.id,
      referenceId: reference.value
    });
  }

  function unlinkReference() {
    messenger.send(CommandName.UnlinkReference, {
      styleId: style.id
    });
  }
</script>

<div class="stack" style="--stack-space: 16px;">
  <div class="stack" style="--stack-space: 4px;">
    <p class="description">Reference</p>
    <div use:hackSelectOffset={88} class="field">
      <SelectMenu
        placeholder="Pick a Local Style"
        menuItems={suggestions}
        bind:value={reference}
        on:change={linkReference}
      />

      {#if foundReference}
        <span class="action-icons">
          <IconButton iconName={IconBreak} on:click={unlinkReference} />
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .field {
    display: flex;
    align-items: center;
  }

  .field > :global(div) {
    flex-grow: 1;
  }

  .field .action-icons {
    margin-left: auto;
    display: flex;
  }
</style>
