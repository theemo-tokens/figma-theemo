<script lang="ts">
  import Section from '../components/Section.svelte';
  import {
    Input,
    Button,
    SelectMenu,
    IconButton,
    IconSwap
  } from 'figma-plugin-ds-svelte';
  import Title from '../components/Title.svelte';
  import { messenger } from '../infrastructure';
  import { filterStyles } from '@theemo-figma/core/migrate';
  import { hackSelectOffset } from '../ui';

  let collections, collection, searchPhrase, styles;

  $: filteredStyles = styles ? filterStyles(styles, searchPhrase) : [];

  // listeners
  messenger.addListener('collections-collected', updateCollections);
  messenger.addListener('migration-styles-collected', updateStyles);

  // Commands

  function collectCollections() {
    messenger.send('collect-collections');
  }

  function collectStylesForMigration() {
    messenger.send('collect-migration-styles');
  }

  function migrate() {
    messenger.send('migrate-styles', {
      collection: collection.value,
      searchPhrase
    });
  }

  // Listeners

  function updateStyles(data: PaintStyle[]) {
    styles = data;
  }

  function updateCollections(data: VariableCollection[]) {
    collections = (data ?? []).map((coll) => {
      return {
        value: coll.id,
        label: coll.name
      };
    });

    if (!collection && data.length > 0) {
      collection = collections[0];
    }
  }

  collectCollections();
  collectStylesForMigration();
</script>

<Section>
  <div class="stack">
    <Title>Collection</Title>
    <p class="description">
      Select a Collection in which you want to migrate Styles into
    </p>

    <div class="collections-select" use:hackSelectOffset={46}>
      <SelectMenu
        placeholder="Create Collection and hit reload"
        menuItems={collections}
        bind:value={collection}
      />

      <IconButton iconName={IconSwap} on:click={collectCollections} />
    </div>

    <Title>Styles</Title>
    <Input type="search" bind:value={searchPhrase} placeholder="Filter" />

    <p>Matched Styles</p>
    <select id="migration.match" size="7" disabled>
      {#each filteredStyles as style}
        <option>{style.name}</option>
      {/each}
    </select>
  </div>

  <Button slot="footer" on:click={migrate}>Migrate</Button>
</Section>

<style>
  .collections-select {
    display: flex;
  }

  .collections-select > :global(div:first-child) {
    flex-grow: 1;
  }
</style>
