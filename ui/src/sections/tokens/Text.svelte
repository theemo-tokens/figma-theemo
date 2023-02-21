<script>
  import { texts } from '../../tokens';
  import Layout from './Layout.svelte';
</script>

<Layout tokens={$texts} let:token>
  Hello {token.name}
</Layout>
