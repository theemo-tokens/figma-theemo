<script>
  import { colors } from '../../tokens';
  import Layout from './Layout.svelte';
</script>

<Layout tokens={$colors} let:token>
  Hello {token.name}
</Layout>
