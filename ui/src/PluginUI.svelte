<script>
  import { section } from './ui';
  import { version } from './settings';
  import TabBar from './components/TabBar.svelte';
  import TabItem from './components/TabItem.svelte';
  import Selection from './sections/Selection.svelte';
  import Settings from './sections/Settings.svelte';
  import Contexts from './sections/Contexts.svelte';
  import Migration from './sections/Migration.svelte';
  import Tools from './sections/Tools.svelte';
  import Styles from './sections/Styles.svelte';

  import { Icon } from 'figma-plugin-ds-svelte';
  import IconSettings from './assets/icons/settings.svg';
  import MigrationDashboard from './sections/MigrationDashboard.svelte';

  $: {
    if ($version === '2') {
      $section = 'styles';
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
  {/if}
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
{/if}
