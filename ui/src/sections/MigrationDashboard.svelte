<script lang="ts">
  import { section } from '../ui';
  import Section from '../components/Section.svelte';
  import Title from '../components/Title.svelte';
  import { messenger } from '../infrastructure';
  import { IconButton } from 'figma-plugin-ds-svelte';
  import IconLocate from '../assets/icons/locate.svg';
  import Alert from '../components/Alert.svelte';

  let nodes = [];

  messenger.send('collect-nodes');

  // listeners
  messenger.addListener('nodes-collected', (data) => {
    nodes = data;
  });

  function selectNode(nodeId: string) {
    messenger.send('select-node', nodeId);
    $section = 'selection';
  }
</script>

<Section>
  <Title>Migration Dashboard</Title>

  <Alert type="danger" mode="outline">
    Create a DUPLICATE of your theme file at first (don't forget to import from
    jsonbin). Do a DRY-RUN! Repeat until you are happy with the result, then do
    it on your production file.
  </Alert>

  <p class="description">
    Historically Theemo stored its references with its configurations on the
    nodes on the canvas itself. With Theemo v2 a migration is happening to
    migrate configuration of styles onto a <code>.theemo/config</code> grid
    style (to make it persistent for duplicating themes) and paint styles will
    migrate over variables as much as possible.<br />
  </p>

  <p class="description">
    Transforms will stay on styles (as this is where the plugin can intersect).
    During migration transforms may be turned off and it is expected that colors
    temporarily change until migration is complete and transforms re-apply.
  </p>

  <p class="description">
    This list helps you to control the migration status. Hop over to
    <code>Migration</code> panel to migrate styles in batches and assign them to
    their desired collections.
  </p>

  <table class="table">
    <tr>
      <th>Name</th>
      <th>Associated Styles</th>
    </tr>

    {#each nodes as node}
      <tr>
        <td class="name">
          <IconButton
            class="icon-locate"
            on:click={() => selectNode(node.id)}
            iconName={IconLocate}>Select</IconButton
          >
          {node.name}
        </td>
        <td>{node.styles.join(', ')}</td>
      </tr>
    {/each}
  </table>
</Section>

<style>
  .table {
    font-size: var(--font-size-small);
  }

  .table th {
    text-align: left;
  }

  .name {
    display: flex;
    align-items: center;
  }

  :global(.icon-locate) {
    width: 20px !important;
    height: 20px !important;
  }

  :global(.icon-locate > div) {
    fill: white !important;
  }
</style>
