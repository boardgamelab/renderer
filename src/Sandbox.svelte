<script>
  import Board from './objects/container/Board.svelte';
  import Supply from './objects/container/Supply.svelte';
  import GameObject from './objects/GameObject.svelte';
  import Effects from './Effects.svelte';
  import { drag } from './gestures/drag.ts';
  import { zoom } from './gestures/zoom.ts';
  import { select } from './gestures/select.ts';
  import { preview } from './gestures/preview.ts';
  import { pan } from './gestures/pan.ts';
  import { sm } from './utils/breakpoints.ts';
  import Controls from './Controls.svelte';
  import Hand from './hand/Hand.svelte';
  import Turn from './Turn.svelte';
  import ContextMenu from './ui/menu/context/Context.svelte';
  import Preview from './preview/Preview.svelte';
  import { ToSVGPointWithPan, ToClientPointWithPan } from './utils/svg.ts';
  import { onMount, createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { Init } from './sandbox.ts';
  import { fly } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import { cubicOut, linear } from 'svelte/easing';
  import Seats from './seat/Seats.svelte';

  // A Svelte component that can render a game object.
  export let renderer = null;
  export let schema;
  export let state;
  export let seatID = null;
  export let players = null;
  export let multiplayer = false;

  const dispatch = createEventDispatcher();
  const isDragging = writable(false);
  const isPanning = writable(false);

  setContext('schema', schema);
  setContext('renderer', renderer);
  setContext('seatID', seatID);
  setContext('isDragging', isDragging);

  let debug = false;
  let svg = { el: null };
  let handID = null;

  const viewOnly = writable(false);
  setContext('viewOnly', viewOnly);

  $: {
    if ($state.seats && seatID in $state.seats) {
      handID = $state.seats[seatID].handID;
    }

    viewOnly.set(false);
    if (
      $state.game &&
      $state.game.turnOrder !== 'none' &&
      $state.ctx &&
      $state.ctx.currentPlayer !== undefined
    ) {
      viewOnly.set($state.ctx.currentPlayer !== seatID);
    }
  }

  const { dispatchActions, objects, stateStore, activeObjects } = Init(
    schema,
    state,
    svg,
    dispatch
  );

  const selectBox = writable(null);

  const zoomLevel = tweened(1, {
    duration: 200,
    easing: cubicOut,
  });

  setContext('zoom', zoomLevel);

  // A multiplier to translate the current zoom level into a length.
  const zoomLength = 1000;

  let zoomOffsetX = 0;
  let zoomOffsetY = 0;
  $: {
    zoomOffsetX = (zoomLength * (1 - $zoomLevel)) / 2;
    zoomOffsetY = (zoomLength * (1 - $zoomLevel)) / 2;
  }

  const panX = tweened(0, {
    duration: 200,
    easing: linear,
  });

  const panY = tweened(0, {
    duration: 200,
    easing: linear,
  });

  function ResetViewport(duration = 0) {
    const board = document.querySelector('#game');
    if (!board) {
      return;
    }

    const bbox = board.getBBox();

    const z1 = bbox.width / zoomLength;
    const z2 = bbox.height / zoomLength;
    const z = Math.max(z1, z2);

    const actualZoom = Math.max(5, z * 1.5);

    const px = (zoomLength * (1 - z)) / 2;
    const py = (zoomLength * (1 - z)) / 2;

    panX.set(px, { duration });
    panY.set(py, { duration });

    zoomLevel.set(actualZoom, { duration });
  }

  onMount(() => {
    ResetViewport();
  });

  function ToSVGPoint(point) {
    return ToSVGPointWithPan(point, svg.el, $panX, $panY);
  }
  function ToClientPoint(point) {
    return ToClientPointWithPan(point, svg.el, $panX, $panY);
  }
  setContext('to-svg-point', ToSVGPoint);
  setContext('to-client-point', ToClientPoint);

  let previewAPI = writable({});

  let clientWidth;
  let isMobile = writable(false);
  setContext('isMobile', isMobile);

  $: {
    isMobile.set(clientWidth < sm);
  }
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1.0,user-scalable=no"
  />
</svelte:head>

<svelte:window
  bind:innerWidth={clientWidth}
  on:error={(e) => {
    dispatch('error', e);
  }}
/>

<span
  class="select-none"
  use:preview={{ api: $previewAPI }}
  use:drag={{ dispatchActions, svg, panX: $panX, panY: $panY, isDragging }}
  use:select={{
    panX: $panX,
    panY: $panY,
    svg,
    activeObjects,
    selectBox,
    schema: $schema,
    state: $stateStore,
  }}
>
  <svg
    id="root"
    data-selectable="box"
    bind:this={svg.el}
    class="select-none w-full h-full"
    viewBox="{zoomOffsetX}
    {zoomOffsetY}
    {$zoomLevel *
      zoomLength}
    {$zoomLevel * zoomLength}"
    use:pan={{ panX, panY, activeObjects, isPanning }}
    use:zoom={{ zoomLevel }}
    on:touchmove|preventDefault={() => {}}
    on:contextmenu|preventDefault={() => {}}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate({$panX}, {$panY})">
      <Board {state} board={$schema.game.board} snapKeySuffix="game" />

      {#each $objects as obj (obj.id)}
        <GameObject id={obj.id} {obj} />
      {/each}
    </g>

    {#if $selectBox}
      <rect
        fill="#aaa"
        fill-opacity="0.2"
        stroke-width="10"
        stroke="#aaa"
        x={$selectBox.x}
        y={$selectBox.y}
        width={$selectBox.width}
        height={$selectBox.height}
      />
    {/if}
  </svg>

  {#if handID && !$isPanning}
    <div
      transition:fly|local={{ y: 50, duration: 200 }}
      data-handid={handID}
      class="absolute bottom-0 w-full"
    >
      <Hand {handID} hand={$stateStore.objects[handID]} />
    </div>
  {/if}

  {#if players && multiplayer}
    <Seats {players} {seatID} />
  {/if}

  {#if !$isPanning}
    <Supply {state} />
  {/if}

  {#if multiplayer && $stateStore.ctx}
    <Turn {seatID} game={$stateStore.game} ctx={$stateStore.ctx} />
  {/if}
</span>

<Preview api={previewAPI} />

<Controls {zoomLevel} reset={ResetViewport} />

<ContextMenu />

{#if debug}
  <div
    on:wheel|stopPropagation
    class="hidden opacity-75 md:block fixed z-50 top-0 mt-16 overflow-y-auto
    h-screen right-0 bg-white shadow-lg p-8 text-xs"
  >
    <pre>{JSON.stringify($stateStore, null, 2)}</pre>
  </div>
{/if}
