<script>
  export let items;
  export let selection;
  export let select;

  import Listbox from 'makeup-listbox';
  import { onMount } from 'svelte';

  let list;

  onMount(() => {
    const listbox = new Listbox(list);

    list.addEventListener('makeup-listbox-change', function (e) {
      const index = e.detail.optionIndex;
      const item = items[index];

      if (item && select) {
        select(item);
      }
    });

    list.addEventListener('focus', function (e) {
      if (selection) {
        const index = items.indexOf(selection);
        if (index !== -1) {
          listbox.select(index);
        }
      }
    });

    // list.addEventListener('navigationModelInit', function (e) {
    //   console.log('navigationModelInit', e);
    // });

    // list.addEventListener('activeDescendantInit', function (e) {
    //   console.log('activeDescendantInit', e);
    // });
  });
</script>

<ul class="list" bind:this={list} tabindex="0" role="listbox">
  {#each items as item}
    <li aria-selected={item === selection} role="option">
      <slot {item} />
    </li>
  {/each}
</ul>

<style>
  .list {
    border: 1px solid var(--figma-color-border);
    border-radius: var(--border-radius-small);
    overflow-x: overlay;
    overflow-y: auto;
    margin: 0;
    padding: 0;
  }

  .list li {
    padding: 4px;
    cursor: default;
  }

  .list li:hover {
    background-color: var(--figma-color-bg-hover);
  }

  .list li[aria-selected='true'] {
    background-color: var(--figma-color-bg-selected);
  }

  .list li[aria-selected='true']:hover {
    background-color: var(--figma-color-bg-selected-hover);
  }
</style>
