<script>
  import { numerics } from '../../tokens';
  import Layout from './Layout.svelte';
</script>

<Layout tokens={$numerics} let:token>
  Hello {token.name}
</Layout>
