<script lang="ts">
  import {
    GlobalCSS,
    Button,
    Icon,
    IconVisible,
    IconSpinner,
  } from 'figma-plugin-ds-svelte';
  import Messenger from './messenger';

  function notifyMe() {
    const messenger = new Messenger();
    messenger.send('notify', 'hello world');
  }
</script>

<div class="wrapper p-xxsmall">Hello World</div>

{IconSpinner}

<Icon iconName={IconVisible} color="black" />
<Icon iconName={IconSpinner} color="blue" spin />
<Icon iconText="W" color="blue" />

<Button on:click={notifyMe}>hello</Button>
