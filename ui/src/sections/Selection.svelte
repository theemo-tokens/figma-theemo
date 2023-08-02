<script>
  import Section from '../components/Section.svelte';
  import TabBar from '../components/TabBar.svelte';
  import TabItem from '../components/TabItem.svelte';
  import Style from './selection/Style.svelte';
  import { styles } from './selection/data';

  $: selection =
    $styles && Object.values($styles).length > 0
      ? Object.values($styles)[0]
      : undefined;
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

  <Section><Style style={selection} /></Section>
{:else}
  <Section>Please select something to manage style references</Section>
{/if}
