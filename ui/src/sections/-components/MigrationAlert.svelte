<script>
  import Alert from '../../components/Alert.svelte';
  import { Button } from 'figma-plugin-ds-svelte';
  import { section } from '../../ui';
</script>

<Alert type="warning" class="migration-alert {$$props.class}" aria-label="huhu">
  Migrate your reference to variables
  <Button
    on:click={() => ($section = 'migration-dashboard')}
    variant="secondary">Migrate to Variables</Button
  >
</Alert>

<style>
  :global(.migration-alert) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
