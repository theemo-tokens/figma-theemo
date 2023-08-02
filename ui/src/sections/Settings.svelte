<script lang="ts">
  import {
    Input,
    Button,
    IconKey,
    IconLinkConnected
  } from 'figma-plugin-ds-svelte';
  import { type Settings } from '@theemo-figma/core/config';
  import Section from '../components/Section.svelte';
  import Label from '../components/Label.svelte';
  import Title from '../components/Title.svelte';
  import { settings } from '../settings';
  import { messenger } from '../infrastructure';

  $: contextPrefix = $settings['context.prefix'];
  $: binKey = $settings['tools.jsonbin.key'];
  $: binId = $settings['tools.jsonbin.id'];

  function save() {
    messenger.send('save-settings', $settings);
  }

  function update(field: keyof Settings) {
    return function (event: Event) {
      settings.set({
        ...$settings,
        [field]: (event.target as HTMLInputElement).value
      });
    };
  }
</script>

<Section>
  <div class="grid settings">
    <Title class="row">Contexts</Title>

    <p class="description row">
      Learn more about <a
        href="https://theemo.io/design/figma/contexts"
        target="_blank">Contexts</a
      >
    </p>

    <Label for="context.prefix">Prefix</Label>
    <Input
      id="context.prefix"
      value={contextPrefix}
      on:change={update('context.prefix')}
    />
    <Title class="row">Export</Title>

    <p class="row description">
      Export to
      <a href="https://jsonbin.io" target="_blank">jsonbin.io</a> -
      <a href="https://theemo.io/design/figma/sync" target="_blank"
        >Export Manual</a
      >
    </p>

    <div class="export grid row">
      <Label for="tools.key">API Key</Label>
      <Input
        id="tools.key"
        value={binKey}
        on:change={update('tools.jsonbin.key')}
        iconName={IconKey}
        placeholder=""
      />

      <Label for="tools.binId">BIN ID</Label>
      <Input
        id="tools.binId"
        value={binId}
        on:change={update('tools.jsonbin.id')}
        iconName={IconLinkConnected}
        placeholder=""
      />
    </div>
  </div>

  <Button slot="footer" on:click={save}>Save</Button>
</Section>

<style>
  .settings {
    row-gap: 8px;
  }

  :global(.grid > [data-title]) {
    margin-top: 16px;
  }

  :global(.grid > [data-title]:first-child) {
    margin-top: 0;
  }
</style>
