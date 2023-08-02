<script lang="ts">
  import Title from '../components/Title.svelte';
  import Section from '../components/Section.svelte';
  import { messenger } from '../infrastructure';
  import {
    Switch,
    Button,
    Input,
    IconButton,
    IconPlay
  } from 'figma-plugin-ds-svelte';
  import { settings } from '../settings';
  import type { CollectedReferencesPayload } from '@theemo-figma/core/sections/tools/events';

  messenger.addListener(
    'references-collected',
    async (data: CollectedReferencesPayload) => {
      await exportReferences(data);
    }
  );

  function toggleAutoUpdate(e: Event) {
    const autoUpdate = (e.target as HTMLInputElement).checked;
    messenger.send('save-settings', {
      'tools.auto-update-references': autoUpdate
    });
  }

  function collect() {
    messenger.send('collect-references');
  }

  async function exportReferences(references: CollectedReferencesPayload) {
    // export data
    await exportData(references);

    // set name
    const name = references.document?.name;
    if (name) {
      await exportName(name);
    }

    this.messenger.send('notify', 'Style References exported');
  }

  async function exportData(references: CollectedReferencesPayload) {
    const id = $settings['tools.jsonbin.id'];
    const url = `https://api.jsonbin.io/v3/b/${id}`;
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': $settings['tools.jsonbin.key']
      },
      body: JSON.stringify(references)
    });
  }

  async function exportName(name: string) {
    const id = $settings['tools.jsonbin.id'];
    const url = `https://api.jsonbin.io/v3/b/${id}/meta/name`;
    await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Master-Key': $settings['tools.jsonbin.key'],
        'X-Bin-Name': name
      }
    });
  }

  let idOrUrl;

  function startImport() {
    if (!idOrUrl) {
      return;
    }

    importReferences(idOrUrl);
    idOrUrl = '';
  }

  async function importReferences(idOrUrl: string) {
    const url = idOrUrl.startsWith('https://')
      ? idOrUrl
      : `https://api.jsonbin.io/v3/b/${idOrUrl}`;

    console.log('fetching', url);

    try {
      const response = await fetch(url, {
        headers: {
          'X-Master-Key': $settings['tools.jsonbin.key']
        }
      });

      const data = await response.json();

      if (response.ok) {
        messenger.send('import', data.record);
      } else {
        messenger.send('notify', `Problem with import: ${data.message}`);
      }
    } catch (e) {
      messenger.send('notify', `Problem fetching data from ${url}`);
    }
  }
</script>

<Section>
  <Title>Auto Update</Title>
  <Switch
    checked={$settings['tools.auto-update-references']}
    on:change={toggleAutoUpdate}
  >
    Auto Update Style References
  </Switch>

  <Title>Export</Title>
  <p class="description">
    Export references to jsonbin.io to be consumable by third-party consumers.
    Go to settings tab to set credentials.
  </p>
  <div class="cluster">
    <Button
      on:click={collect}
      disabled={!(
        $settings['tools.jsonbin.key'] && $settings['tools.jsonbin.id']
      )}>Export References</Button
    >
  </div>

  <Title>Import</Title>
  <p class="description">
    Import references from jsonbin.io. That is very helpful if you duplicated a
    document and want to copy over references (as figma's duplicate doesn't take
    them over).
  </p>
  <form class="form" on:submit|preventDefault={startImport}>
    <Input
      bind:value={idOrUrl}
      placeholder="jsonbin.io ID or URL"
      class="bin-name"
    />

    <IconButton type="submit" iconName={IconPlay} />
  </form>
</Section>

<style>
  .form {
    display: flex;
  }

  .form :global(.bin-name) {
    flex-grow: 1;
  }
</style>
