<script>
  import { messenger } from '../infrastructure';
  import Section from '../components/Section.svelte';
  import TabBar from '../components/TabBar.svelte';
  import TabItem from '../components/TabItem.svelte';
  import Style from './selection/Style.svelte';
  import { styles } from './selection/data';
  import MigrationAlert from './-components/MigrationAlert.svelte';

  $: selection =
    $styles && Object.values($styles).length > 0
      ? Object.values($styles)[0]
      : undefined;

  messenger.send('read-selection');
</script>

{#if $styles}
  <TabBar>
    {#each Object.values($styles) as style}
      <TabItem
        activate={() => (selection = style)}
        active={selection === style}
      >
        {style.section}
      </TabItem>
    {/each}
  </TabBar>

  <Section>
    <MigrationAlert />
    <Style style={selection} />
  </Section>
{:else}
  <Section>
    <MigrationAlert />
    Please select something to manage style references
  </Section>
{/if}
