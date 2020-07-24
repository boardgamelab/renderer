<script>
  export let handID;
  export let hand = {};

  import HandObject from './HandObject.svelte';
  import { send } from '../utils/crossfade.ts';
  import { flip } from 'svelte/animate';
  import { getContext, tick } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { GetGameObject } from '../objects/game-object.ts';

  const schema = getContext('schema');
  const toSVGPoint = getContext('to-svg-point');
  const { dispatchActions, state } = getContext('context');
  const highlight = getContext('highlight');

  let list = [];
  $: {
    list = [];
    if (hand && hand.children) {
      list = hand.children.map((id) => GetGameObject($schema, $state, id));
    }
  }

  let ghost;
  let ghostPos = { x: 0, y: 0 };
  let ghostOffset = tweened({ dx: 0, dy: 0 }, { duration: 0 });
  let movedIndex = null;
  let movedID = null;

  async function MoveStart({ detail }) {
    movedIndex = detail.index;
    movedID = detail.id;
    await tick();

    const rect = detail.ref.getBoundingClientRect();

    // These are rounded to integers so that the ghost is sharp.
    ghostPos = {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
    };

    // TODO: Have this be exposed via context in order
    // to manipulate the ghost at the top-level.
    ghostOffset.set({ dx: 0, dy: 0 });
    ghost.innerHTML = detail.ref.outerHTML;
  }

  function Move({ detail }) {
    ghostOffset.set({
      dx: detail.client.dx,
      dy: detail.client.dy,
    });
  }

  async function MoveEnd() {
    // await ghostOffset.set({ dx: 0, dy: 0 }, { duration: 200 });
    movedIndex = null;
  }

  function MouseEnter(index) {
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
      on:mouseenter={() => MouseEnter(index)}
      animate:flip={{ duration: 300 }}>
      <HandObject
        on:movestart={MoveStart}
        on:move={Move}
        on:moveend={MoveEnd}
        {handID}
        {index}
        id={obj.id}
        {obj} />
    </div>
  {/each}

  {#if movedIndex !== null}
    <div
      bind:this={ghost}
      out:send={{ key: movedID, toSVGPoint, ghost: true }}
      style="transform: translate3d({ghostPos.x + $ghostOffset.dx}px, {ghostPos.y + $ghostOffset.dy}px,
      0)"
      class="pointer-events-none fixed top-0 left-0" />
  {/if}

</div>
