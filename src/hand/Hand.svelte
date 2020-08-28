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
  let swapTarget = null;

  async function MoveStart({ detail }) {
    movedIndex = detail.index;
  }

  async function MoveEnd() {
    movedIndex = null;
    swapTarget = null;
  }

  function CheckElementEnter(e) {
    const touch = e.touches[0];

    let el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      el = el.closest('[data-sortable=true]');
    }

    if (el) {
      const index = Number(el.dataset.index);
      ElementEnter(index);
    }
  }

  // Swap element with another in hand that we just moved over.
  function ElementEnter(index) {
    if (movedIndex === null || movedIndex === index || index === swapTarget) {
      return;
    }

    swapTarget = index;

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
    @apply relative select-none rounded-t h-10 py-1 font-bold flex flex-row items-end justify-center w-full bg-white;
  }

  .show {
    @apply opacity-100;
  }

  .active {
    @apply shadow-xl;
  }
</style>

<div
  class="shadow-lg w-3/4 max-w-2xl mx-auto border border-t-8 border-gray-400
  shadow-lg rounded-t transition duration-200"
  class:active={handID in $highlight}
  data-id={handID}
  data-droppable="true">

  <div
    on:contextmenu|preventDefault={() => {}}
    on:touchmove={CheckElementEnter}
    data-hand="true"
    class="hand">
    {#if list.length === 0}
      <div class="text-gray-500">PLAYER HAND</div>
    {/if}

    {#each list as obj, index (obj.id)}
      <div
        data-index={index}
        data-sortable="true"
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
</div>
