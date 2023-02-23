<script>
  import { section, messenger } from './ui';
  import { setContext } from 'svelte';
  import TabBar from './components/TabBar.svelte';
  import Selection from './sections/Selection.svelte';
  import Tokens from './sections/Tokens.svelte';
  import Theme from './sections/Theme.svelte';
  import { get } from 'svelte/store';

  setContext('messenger', get(messenger));

  let activeSection;

  section.subscribe((value) => {
    activeSection = value;
  });
</script>

<TabBar />

{#if activeSection === 'selection'}
  <Selection />
{:else if activeSection === 'tokens'}
  <Tokens />
{:else if activeSection === 'theme'}
  <Theme />
{/if}

<style>
  .container {
    width: 100%;
    overflow-y: hidden;
  }
</style>
