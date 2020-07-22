<script>
  export let handID;
  export let hand = {};

  import HandObject from './HandObject.svelte';
  import { flip } from 'svelte/animate';
  import { getContext } from 'svelte';
  import { GetGameObject } from '../objects/game-object.ts';

  const schema = getContext('schema');
  const { state } = getContext('context');
  const highlight = getContext('highlight');

  let list = [];
  $: {
    list = [];
    if (hand && hand.children) {
      list = hand.children.map((id) => GetGameObject($schema, $state, id));
    }
  }
</script>

<style>
  .hand {
    @apply relative select-none h-16 py-1 transform duration-100 text-xl border-t-2 border-dashed text-gray-500 font-bold flex flex-row items-end justify-center w-full;
    background: rgba(200, 200, 200, 0.1);
  }

  .active {
    border: none;
    background: rgba(200, 200, 200, 0.6);
  }
</style>

<div
  data-id={handID}
  data-droppable="true"
  on:contextmenu|preventDefault={() => {}}
  class:active={handID in $highlight}
  data-hand="true"
  class="hand">
  {#if list.length === 0}
    <div class="pb-4">PLAYER HAND</div>
  {/if}

  {#each list as obj (obj.id)}
    <div animate:flip={{ duration: 100 }}>
      <HandObject {handID} id={obj.id} {obj} />
    </div>
  {/each}
</div>
