<script lang="ts" generics="T">
  import Listbox from 'makeup-listbox';
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';

  let { items, isSelected, select, children }: {
    items: T[];
    isSelected?: (item: T) => boolean;
    select?: (item: T) => void;
    children?: Snippet<[{ item: T }]>;
  } = $props();

  let list = $state<HTMLUListElement | undefined>(undefined);
  let listbox: Listbox | undefined;

  onMount(() => {
    if (!list) return;

    listbox = new Listbox(list);

    list.addEventListener('makeup-listbox-change', function (event) {
      const { optionIndex } = (event as CustomEvent<{ optionIndex: number }>).detail;
      const item = items[optionIndex];

      if (item && select) {
        select(item);
      }
    });

    list.addEventListener('focus', function () {
      if (isSelected) {
        const index = items.findIndex((item) => isSelected(item));
        if (index !== -1) {
          listbox?.select(index);
        }
      }
    });
  });

  onDestroy(() => {
    if (listbox) {
      listbox.destroy();
    }
  });
</script>

<ul class="list" bind:this={list} tabindex="0" role="listbox">
  {#each items ?? [] as item (item)}
    <li aria-selected={isSelected?.(item) ?? false} role="option">
      {@render children?.({ item })}
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
