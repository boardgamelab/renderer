<script>
  export let hand = {};
  export let hoverObject = null;

  import HandObject from './HandObject.svelte';

  let list = [];
  $: {
    list = [];
    if (hand && hand.children) {
      list = hand.children;
    }
  }
</script>

<style>
  .hand {
    @apply relative h-32 transform duration-100 text-xl border-t-2 border-dashed text-gray-500 font-bold flex flex-row items-center justify-center w-full;
    background: rgba(200, 200, 200, 0.1);
  }

  .hover {
    background: rgba(200, 200, 200, 0.5);
  }
</style>

<div id="hand" data-hand="true" class="hand" class:hover={hoverObject}>
  {#each list as id (id)}
    <HandObject {id} />
  {/each}
</div>
