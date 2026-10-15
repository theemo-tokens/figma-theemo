<script lang="ts">
  import { section } from './ui';
  import { messenger } from './infrastructure';
  import TabBar from './components/TabBar.svelte';
  import TabItem from './components/TabItem.svelte';
  import Styles from './sections/Styles.svelte';
  import About from './sections/About.svelte';
  import { Icon } from 'figma-plugin-ds-svelte';
  import IconInfo from './assets/icons/info.svg';
  import IconChevronLeft from './assets/icons/chevron-left.svg';

  let windowMaximized = true;

  function toggleWindowMaximize(e: Event) {
    if (windowMaximized) {
      messenger.send('minimize');
      windowMaximized = false;
    } else {
      messenger.send('maximize');
      windowMaximized = true;
    }
  }
</script>

<TabBar>
  <TabItem
    activate={() => section.set('styles')}
    active={$section === 'styles'}>Styles</TabItem
  >

  <span style="margin-left: auto;" />

  <TabItem activate={() => section.set('about')} active={$section === 'about'}>
    <Icon iconName={IconInfo} class="icon" />
  </TabItem>

  <TabItem activate={toggleWindowMaximize}>
    <Icon
      iconName={IconChevronLeft}
      class="icon window-control {windowMaximized ? '' : 'minimized'}"
    />
  </TabItem>
</TabBar>

{#if $section === 'styles'}
  <Styles />
{:else if $section === 'about'}
  <About />
{/if}

<style>
  :global(.window-control) {
    transform: rotate(-90deg);
  }

  :global(.window-control.minimized) {
    transform: rotate(90deg);
  }
</style>
