<script lang="ts">
  import { section } from './ui';
  import { version } from './settings';
  import { messenger } from './infrastructure';
  import TabBar from './components/TabBar.svelte';
  import TabItem from './components/TabItem.svelte';
  import Selection from './sections/Selection.svelte';
  import Settings from './sections/Settings.svelte';
  import Contexts from './sections/Contexts.svelte';
  import Migration from './sections/Migration.svelte';
  import Tools from './sections/Tools.svelte';
  import Styles from './sections/Styles.svelte';
  import About from './sections/About.svelte';
  import { Icon, IconButton } from 'figma-plugin-ds-svelte';
  import IconSettings from './assets/icons/settings.svg';
  import IconInfo from './assets/icons/info.svg';
  import IconChevronLeft from './assets/icons/chevron-left.svg';
  import MigrationDashboard from './sections/MigrationDashboard.svelte';

  $: {
    if ($version === '2') {
      $section = 'styles';
    }
  }

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
  {#if $version === '1'}
    <TabItem
      activate={() => section.set('selection')}
      active={$section === 'selection'}>Selection</TabItem
    >

    <TabItem
      activate={() => section.set('styles')}
      active={$section === 'styles'}>Styles</TabItem
    >

    <TabItem activate={() => section.set('tools')} active={$section === 'tools'}
      >Tools</TabItem
    >

    <TabItem
      activate={() => section.set('contexts')}
      active={$section === 'contexts'}>Contexts</TabItem
    >

    <TabItem
      activate={() => section.set('migration-dashboard')}
      active={$section === 'migration-dashboard'}
    >
      Migration
    </TabItem>

    <TabItem
      activate={() => section.set('migration')}
      active={$section === 'migration'}>Migrate Styles</TabItem
    >

    <span style="margin-left: auto;" />

    <TabItem
      activate={() => section.set('settings')}
      active={$section === 'settings'}
    >
      <Icon iconName={IconSettings} class="icon" />
    </TabItem>
  {:else}
    <TabItem
      activate={() => section.set('styles')}
      active={$section === 'styles'}>Styles</TabItem
    >

    <span style="margin-left: auto;" />
  {/if}

  <TabItem activate={() => section.set('about')} active={$section === 'about'}>
    <Icon iconName={IconInfo} class="icon" />
  </TabItem>

  <TabItem activate={toggleWindowMaximize}>
    <Icon
      iconName={IconChevronLeft}
      class="icon window-control {windowMaximized ? '' : 'minimized'}"
    />
  </TabItem>

  <!-- <IconButton
    iconName={IconBack}
    class="window-control {windowMaximized ? '' : 'minimized'}"
    on:click={toggleWindowMaximize}
  /> -->
</TabBar>

{#if $section === 'selection'}
  <Selection />
{:else if $section === 'styles'}
  <Styles />
{:else if $section === 'tools'}
  <Tools />
{:else if $section === 'contexts'}
  <Contexts />
{:else if $section === 'migration'}
  <Migration />
{:else if $section === 'migration-dashboard'}
  <MigrationDashboard />
{:else if $section === 'settings'}
  <Settings />
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
