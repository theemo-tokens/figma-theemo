<script lang="ts">
  import {
    Input,
    Icon,
    IconButton,
    IconBlend,
    IconTrash,
    IconPlus
  } from 'figma-plugin-ds-svelte';
  import Section from '../components/Section.svelte';
  import Title from '../components/Title.svelte';
  import { settings } from '../settings';
  import { messenger } from '../infrastructure';

  $: contexts = $settings.contexts;
  $: activeContext = $settings.context;

  let newContext;

  function add() {
    if (!newContext) {
      return;
    }

    messenger.send('add-context', newContext);
    newContext = '';
  }

  function remove(context: string) {
    messenger.send('remove-context', context);
  }

  function activate(context: string) {
    messenger.send('select-context', context);
  }
</script>

<Section>
  <Title>Add Context</Title>
  <form class="form" on:submit|preventDefault={add}>
    <Input
      bind:value={newContext}
      placeholder="New Context Name"
      class="context-name"
    />

    <IconButton type="submit" iconName={IconPlus} on:click={add} />
  </form>

  <Title>Select Context</Title>
  <ul class="context-list">
    {#each contexts as context}
      <li
        on:click={() => activate(context)}
        class:active={context === activeContext}
      >
        <div>
          <Icon iconName={IconBlend} />
          {context}
          <!-- <span class="icon icon--blend" />
          <span class="name type--pos-medium-normal" /> -->
        </div>
        <IconButton
          on:click={() => remove(context)}
          iconName={IconTrash}
          class="remove"
        />
      </li>
    {/each}
  </ul>
</Section>

<style>
  .form {
    display: flex;
  }

  .form :global(.context-name) {
    flex-grow: 1;
  }

  .context-list {
    list-style-type: none;
    margin: 0 -16px;
    padding: 0;
  }

  .context-list li {
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    cursor: default;
  }

  .context-list li > div {
    display: flex;
    align-items: center;
  }

  .context-list :global(.remove) {
    display: none;
  }

  .context-list li:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  .context-list li:hover :global(.remove) {
    display: inline-block;
  }

  .context-list .active {
    font-weight: 600;
  }
</style>
