<script>
  import './styles/variables';
  import { messenger } from '../infrastructure';
  import Section from '../components/Section.svelte';
  import TabBar from '../components/TabBar.svelte';
  import TabItem from '../components/TabItem.svelte';
  import Color from './styles/Color.svelte';
  import Effect from './styles/Effect.svelte';
  import Text from './styles/Text.svelte';
  import Layout from './styles/Layout.svelte';
  import { colors, texts, effects } from './styles/data';

  let type = 'colors';
  $: styles = getFromType(type);

  function getFromType(type) {
    switch (type) {
      case 'texts':
        return texts;

      case 'effects':
        return effects;

      case 'colors':
      default:
        return colors;
    }
  }

  messenger.send('collect-collections');
  messenger.send('collect-variables');
</script>

<TabBar>
  <TabItem activate={() => (type = 'colors')} active={type === 'colors'}>
    Colors
  </TabItem>

  <TabItem activate={() => (type = 'texts')} active={type === 'texts'}>
    Text
  </TabItem>

  <TabItem activate={() => (type = 'effects')} active={type === 'effects'}>
    Effect
  </TabItem>
</TabBar>

<Section>
  <Layout styles={$styles} let:style>
    {#if type === 'colors'}
      <Color {style} />
    {:else if type === 'texts'}
      <Text {style} />
    {:else if type === 'effects'}
      <Effect {style} />
    {/if}
  </Layout>
</Section>
