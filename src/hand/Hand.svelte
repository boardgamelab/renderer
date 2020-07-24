<script>
  export let handID;
  export let hand = {};

  import HandObject from './HandObject.svelte';
  import { flip } from 'svelte/animate';
  import { getContext } from 'svelte';
  import { GetGameObject } from '../objects/game-object.ts';

  const schema = getContext('schema');
  const { dispatchActions, state } = getContext('context');
  const highlight = getContext('highlight');

  let list = [];
  $: {
    list = [];
    if (hand && hand.children) {
      list = hand.children.map((id) => GetGameObject($schema, $state, id));
    }
  }

  let movedIndex = null;

  async function MoveStart({ detail }) {
    movedIndex = detail.index;
  }

  async function MoveEnd() {
    movedIndex = null;
  }

  // Swap element with another in hand that we just moved over.
  function ElementEnter(index) {
    if (movedIndex === null || movedIndex === index) {
      return;
    }

    let indices = [...Array(list.length).keys()];

    indices[movedIndex] = index;
    indices[index] = movedIndex;

    movedIndex = index;

    dispatchActions([
      {
        type: 'container',
        subtype: 'reorder',
        subject: { id: handID },
        children: indices,
      },
    ]);
  }
</script>

<style>
  .hand {
    @apply relative select-none h-16 py-1 text-xl border-t-2 border-dashed text-gray-500 font-bold flex flex-row items-end justify-center w-full;
    background: rgba(200, 200, 200, 0.1);
  }

  .show {
    @apply opacity-100;
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

  {#each list as obj, index (obj.id)}
    <div
      on:mouseenter={() => ElementEnter(index)}
      animate:flip={{ duration: 300 }}>
      <HandObject
        on:movestart={MoveStart}
        on:moveend={MoveEnd}
        {handID}
        {index}
        id={obj.id}
        {obj} />
    </div>
  {/each}

</div>
