<script>
  import { effects } from '../../tokens';
  import Layout from './Layout.svelte';
</script>

<Layout tokens={$effects} let:token>
  Hello {token.name}
</Layout>
