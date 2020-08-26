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
    @apply relative select-none h-8 py-1 border-t font-bold flex flex-row items-end justify-center w-full bg-white;
  }

  .show {
    @apply opacity-100;
  }

  .active {
    @apply bg-gray-600 h-6;
  }
</style>

<div
  class="w-3/4 max-w-2xl mx-auto shadow-lg border rounded-tl-lg rounded-tr-lg"
  data-id={handID}
  data-droppable="true">
  <div
    class:active={handID in $highlight}
    class="transform duration-200 h-4 center text-xs text-white rounded-tl-lg
    rounded-tr-lg bg-gray-300" />

  <div
    on:contextmenu|preventDefault={() => {}}
    on:touchmove={CheckElementEnter}
    data-hand="true"
    class="hand">
    {#if list.length === 0}
      <div class="text-gray-500 text-xs">PLAYER HAND</div>
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
