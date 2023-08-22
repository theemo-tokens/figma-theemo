<script lang="ts">
  import Label from '../../components/Label.svelte';
  import { messenger } from '../../infrastructure';
  import {
    Button,
    Input,
    Icon,
    IconButton,
    IconBreak,
    IconPlus,
    IconStyles,
    IconAlert,
    SelectMenu
  } from 'figma-plugin-ds-svelte';
  import { hackSelectOffset } from '../../ui';

  interface StyleIdentifier {
    id: string;
    name: string;
  }

  interface Reference {
    local: StyleIdentifier;
    from: StyleIdentifier;
    to: StyleIdentifier;
    transforms?: object;
  }

  interface Style {
    node: { id: string };
    section: string;
    collection: string;
    data: Reference;
    suggestions: BaseStyle[];
  }
  export let style: Style;
  $: style;

  $: suggestions = style.suggestions.map((base) => {
    return {
      value: base.id,
      label: base.name,
      group: base.name.substring(0, base.name.lastIndexOf('/'))
    };
  });

  $: origin = style.data.to ? style.data.from : style.data.local;
  $: selectedOrigin = suggestions.find(
    (suggestion) => suggestion.value === origin?.id
  );
  $: needsMigration = style.data.to
    ? style.data.to.id !== style.data.local.id
    : false;
  $: canUnlinkOrigin = (origin || style.data.local) && !style.data.to;
  $: referenceExists = style.data.to;

  // transforms
  $: hue =
    style.data.transforms && style.data.transforms['hue'] !== undefined
      ? style.data.transforms['hue']
      : undefined;
  $: saturation =
    style.data.transforms && style.data.transforms['saturation'] !== undefined
      ? style.data.transforms['saturation']
      : undefined;
  $: lightness =
    style.data.transforms && style.data.transforms['lightness'] !== undefined
      ? style.data.transforms['lightness']
      : undefined;
  $: opacity =
    style.data.transforms && style.data.transforms['opacity'] !== undefined
      ? style.data.transforms['opacity']
      : undefined;

  // listening

  messenger.addListener('origin-linked', update);
  messenger.addListener('origin-unlinked', update);
  messenger.addListener('origin-migrated', update);
  messenger.addListener('reference-created', update);
  messenger.addListener('reference-unlinked', update);
  messenger.addListener('transforms-saved', update);

  function update(data) {
    style = {
      ...style,
      data: {
        ...style.data,
        ...data.data
      }
    };
  }

  function send(command: string, data: any = {}) {
    messenger.send(command, {
      node: style.node,
      style: style.section,
      ...data
    });
  }

  // commands
  function link(e) {
    if (e.detail.label) {
      send('link-origin', { name: e.detail.label });
    } else {
      send('unlink-origin');
    }
  }

  // origin unlink
  function unlinkOrigin(e) {
    send('unlink-origin');

    suggestions = suggestions.map((suggestion) => {
      return { ...suggestion, selected: false };
    });
  }

  // migrate keep
  function migrateKeep(e) {
    send('migrate-origin', { target: style.data.from.id });
  }

  // migrate switch
  function migrateSwitch(e) {
    send('migrate-origin', { target: style.data.local.id });
  }

  // create reference
  let referenceName;
  function createReference(e) {
    if (referenceName) {
      const origin = style.data.local;
      send('create-reference', { from: origin.id, name: referenceName });
    }
  }

  // ref unlink
  function unlinkReference() {
    send('unlink-reference');
    referenceName = style.data.to.name;
  }

  function updateTransforms(prop: string) {
    return function (event: Event) {
      const value = (event.target as HTMLInputElement).value;
      const number = Number.parseInt(value, 10);

      let transforms = style.data.transforms;

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

      send('save-transforms', { transforms });
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

<div class="section-grid">
  <Label>Origin</Label>

  {#if !needsMigration}
    <div class="field origin" use:hackSelectOffset={88}>
      <SelectMenu
        placeholder="Pick a Local Style"
        menuItems={suggestions}
        value={selectedOrigin}
        on:change={link}
        class="suggestions"
        iconName={IconStyles}
      />

      {#if canUnlinkOrigin}
        <span class="action-icons">
          <IconButton iconName={IconBreak} on:click={unlinkOrigin} />
        </span>
      {/if}
    </div>
  {/if}

  {#if needsMigration}
    <div class="stack migrate">
      <div class="migrate-alert">
        <Icon iconName={IconAlert} />
        New Style detected, please choose:
      </div>
      <div class="cluster">
        <Button on:click={migrateKeep}>
          Keep <code>{style.data.from.name}</code>
        </Button>
        <Button on:click={migrateSwitch}>
          Switch to <code>{style.data.local.name}</code>
        </Button>
      </div>
    </div>
  {/if}

  <Label>Reference</Label>

  {#if !referenceExists}
    <form class="row-form" on:submit|preventDefault={createReference}>
      <Input bind:value={referenceName} disabled={!style.data.local} />
      <IconButton
        type="submit"
        iconName={IconPlus}
        on:click={createReference}
      />
    </form>
  {/if}

  {#if referenceExists}
    <div class="field">
      <Icon iconName={IconStyles} />
      {style.data.to.name}
      <span class="action-icons">
        <IconButton iconName={IconBreak} on:click={unlinkReference} />
      </span>
    </div>
  {/if}
</div>

{#if style.collection === 'paint' && referenceExists}
  <div data-elem="transforms" class="stack">
    <div class="section-title">Transforms</div>

    <div class="section-grid">
      <Label>HSL</Label>

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
    </div>
  </div>
{/if}

<style>
  .section-grid {
    display: grid;
    grid-template-columns: 60px auto;
    grid-gap: 0 8px;
    gap: 0 8px;
  }

  .origin > :global(div) {
    flex-grow: 1;
  }

  .field {
    display: flex;
    align-items: center;
  }

  .field > span {
    display: flex;
    align-items: center;
  }

  .field .action-icons {
    margin-left: auto;
    display: flex;
  }

  .migrate {
    --stack-space: 0;
  }

  .migrate :global(button) {
    gap: 4px;
  }

  .migrate-alert {
    display: flex;
    align-items: center;
  }

  .input-group {
    display: flex;
    gap: 4px;
  }
</style>
