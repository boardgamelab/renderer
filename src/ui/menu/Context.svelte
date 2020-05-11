<script>
  import { getContext } from 'svelte';

  const { state, activeObjects } = getContext('context');

  let deckMenu = false;
  $: {
    deckMenu = false;
    if (Object.keys($activeObjects).length === 1) {
      const id = Object.keys($activeObjects)[0];
      if ($state.objects[id].children && $state.objects[id].children.length) {
        deckMenu = true;
      }
    }
  }
</script>

<style>
  .item {
    @apply text-xs p-1 px-4 border border-gray-300 rounded cursor-pointer transition duration-200;
  }

  .item:hover {
    @apply bg-gray-100;
  }
</style>

{#if deckMenu}
  <div class="p-4 flex flex-row">
    <div class="item">shuffle</div>
  </div>
{/if}
