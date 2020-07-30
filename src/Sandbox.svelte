<script>
  import GameObject from './objects/GameObject.svelte';
  import Effects from './Effects.svelte';
  import { drag } from './gestures/drag.ts';
  import { zoom } from './gestures/zoom.ts';
  import { select } from './gestures/select.ts';
  import { pan } from './gestures/pan.ts';
  import { sm } from './utils/breakpoints.ts';
  import Hand from './hand/Hand.svelte';
  import ContextMenu from './ui/menu/context/Context.svelte';
  import Ghost from './ghost/Ghost.svelte';
  import { ToSVGPointWithPan, ToClientPointWithPan } from './utils/svg.ts';
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { Init } from './sandbox.ts';
  import { tweened } from 'svelte/motion';
  import { cubicOut, linear } from 'svelte/easing';
  import Seats from './seat/Seats.svelte';

  // A Svelte component that can render a game object.
  export let renderer = null;
  export let schema;
  export let state;
  export let seatID = null;
  export let seats = null;

  const dispatch = createEventDispatcher();

  setContext('schema', schema);
  setContext('renderer', renderer);
  setContext('seatID', seatID);

  let debug = false;
  let svg = { el: null };
  let handID = null;

  $: {
    if ($state.seats && seatID in $state.seats) {
      handID = $state.seats[seatID].handID;
    }
  }

  const { dispatchActions, objects, stateStore, activeObjects } = Init(
    schema,
    state,
    svg,
    dispatch
  );

  // TODO: Need to use something other than card dimensions to
  // determine initial zoom.
  const cardWidth = 600;
  const cardHeight = 720;

  const selectBox = writable(null);

  const zoomLevel = tweened(5, {
    duration: 200,
    easing: cubicOut,
  });

  let zoomOffsetX = 0;
  let zoomOffsetY = 0;
  $: {
    zoomOffsetX = (cardWidth * (1 - $zoomLevel)) / 2;
    zoomOffsetY = (cardHeight * (1 - $zoomLevel)) / 2;
  }

  const panX = tweened(0, {
    duration: 200,
    easing: linear,
  });

  const panY = tweened(0, {
    duration: 200,
    easing: linear,
  });

  function ToSVGPoint(point) {
    return ToSVGPointWithPan(point, svg.el, $panX, $panY);
  }
  function ToClientPoint(point) {
    return ToClientPointWithPan(point, svg.el, $panX, $panY);
  }
  setContext('to-svg-point', ToSVGPoint);
  setContext('to-client-point', ToClientPoint);

  let ghostAPI = writable({});
  setContext('ghost', ghostAPI);

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
    content="width=device-width,initial-scale=1.0,user-scalable=no" />
</svelte:head>

<svelte:window
  bind:innerWidth={clientWidth}
  on:error={(e) => {
    dispatch('error', e);
  }} />

<span
  use:drag={{ dispatchActions, svg, panX: $panX, panY: $panY }}
  use:select={{ panX: $panX, panY: $panY, svg, activeObjects, selectBox, schema: $schema, state: $stateStore }}>
  <svg
    id="root"
    data-selectable="box"
    bind:this={svg.el}
    class="w-full h-full"
    viewBox="{zoomOffsetX}
    {zoomOffsetY}
    {$zoomLevel * cardWidth}
    {$zoomLevel * cardHeight}"
    use:pan={{ panX, panY, activeObjects }}
    use:zoom={{ zoomLevel }}
    on:touchmove|preventDefault={() => {}}
    on:contextmenu|preventDefault={() => {}}
    xmlns="http://www.w3.org/2000/svg">

    <Effects />

    <g transform="translate({$panX}, {$panY})">
      {#each $objects as obj (obj.id)}
        <GameObject id={obj.id} {obj} />
      {/each}
    </g>

    {#if $selectBox}
      <rect
        fill="none"
        stroke-width="10"
        stroke="#aaa"
        x={$selectBox.x}
        y={$selectBox.y}
        width={$selectBox.width}
        height={$selectBox.height} />
    {/if}

  </svg>

  {#if handID}
    <div data-handid={handID} class="absolute bottom-0 w-full">
      <Hand {handID} hand={$stateStore.objects[handID]} />
    </div>
  {/if}

  {#if seats}
    <Seats {state} {seats} {seatID} />
  {/if}
</span>

<Ghost api={ghostAPI} />

<ContextMenu />

{#if debug}
  <div
    on:wheel|stopPropagation
    class="hidden opacity-75 md:block fixed z-50 top-0 mt-16 overflow-y-auto
    h-screen right-0 bg-white shadow-lg p-8 text-xs">
    <pre>{JSON.stringify($stateStore, null, 2)}</pre>
  </div>
{/if}
