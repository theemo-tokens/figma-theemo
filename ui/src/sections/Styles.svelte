<script lang="ts">
  import './styles/variables';
  import type { Readable } from 'svelte/store';
  import type { StyleDescriptor } from '@theemo-figma/core/styles/index';
  import { messenger } from '../infrastructure';
  import Section from '../components/Section.svelte';
  import TabBar from '../components/TabBar.svelte';
  import TabItem from '../components/TabItem.svelte';
  import Color from './styles/Color.svelte';
  import EffectAndText from './styles/EffectAndText.svelte';
  import Layout from './styles/Layout.svelte';
  import { colors, texts, effects } from './styles/data';
  import { CommandName } from '@theemo-figma/core/styles/commands';

  type StyleType = 'colors' | 'texts' | 'effects';

  let type = $state<StyleType>('colors');
  let styles = $derived(getFromType(type));

  function getFromType(type: StyleType): Readable<StyleDescriptor[]> {
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
  messenger.send(CommandName.ReadConfig);
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
  <Layout styles={$styles}>
    {#snippet children({ style })}
      {#if type === 'colors'}
        <Color {style} />
      {:else if type === 'texts'}
        <EffectAndText {style} referenceStyles={$texts} />
      {:else if type === 'effects'}
        <EffectAndText {style} referenceStyles={$effects} />
      {/if}
    {/snippet}
  </Layout>
</Section>
