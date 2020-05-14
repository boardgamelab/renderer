<script>
  import { getContext } from 'svelte';

  const { state, dispatchActions, activeObjects } = getContext('context');

  function Shuffle() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        kind: 'shuffle',
        id,
      },
    ]);
  }

  let deckMenu = false;
  $: {
    deckMenu = false;
    if (Object.keys($activeObjects).length === 1) {
      const id = Object.keys($activeObjects)[0];
      if (
        id in $state.objects &&
        $state.objects[id].children &&
        $state.objects[id].children.length
      ) {
        deckMenu = true;
      }
    }
  }
</script>

<style>
  .item {
    @apply text-xs bg-white select-none p-1 px-4 border border-gray-300 rounded cursor-pointer transition duration-200;
  }

  .item:hover {
    @apply bg-gray-100;
  }

  .item:active {
    @apply bg-gray-300;
  }
</style>

{#if deckMenu}
  <div class="p-4 flex flex-row justify-center">
    <div on:click={Shuffle} class="item">shuffle</div>
  </div>
{/if}
