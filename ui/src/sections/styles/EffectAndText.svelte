<script lang="ts">
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';
  import { Dropdown, IconButton } from 'figma-ui3-kit-svelte';
  import { IconLinkBroken } from 'figma-ui3-kit-svelte/icons';
  import { references } from './data';
  import { CommandName } from '@theemo-figma/core/styles/commands';
  import { messenger } from '../../infrastructure';

  let { style, referenceStyles }: {
    style: StyleDescriptor;
    referenceStyles: StyleDescriptor[];
  } = $props();

  const suggestions = $derived(
    referenceStyles
      .filter((refStyle) => refStyle.id !== style.id)
      .map((refStyle) => ({ value: refStyle.id, label: refStyle.name }))
  );
  const foundReference = $derived(
    $references.find((ref) => ref.styleId === style.id)
  );
  const reference = $derived(
    foundReference
      ? suggestions.find(
          (refStyle) => refStyle.value === foundReference.referenceId
        )
      : undefined
  );

  function linkReference(item: { value?: string | number }) {
    messenger.send(CommandName.LinkReference, {
      styleId: style.id,
      referenceId: String(item.value)
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
    <div class="field">
      <Dropdown
        placeholder="Pick a Local Style"
        menuItems={suggestions}
        value={reference ?? null}
        onchange={linkReference}
      />

      {#if foundReference}
        <span class="action-icons">
          <IconButton
            iconName={IconLinkBroken}
            ariaLabel="Unlink reference"
            onclick={unlinkReference}
          />
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
