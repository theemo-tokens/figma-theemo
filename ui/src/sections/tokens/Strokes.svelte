<script>
  import { strokes } from '../../tokens';
  import Layout from './Layout.svelte';
</script>

<Layout tokens={$strokes} let:token>
  Hello {token.name}
</Layout>
