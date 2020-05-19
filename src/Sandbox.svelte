<script>
  import GameObject from './objects/GameObject.svelte';
  import Effects from './Effects.svelte';
  import { drag } from './gestures/drag.ts';
  import { zoom } from './gestures/zoom.ts';
  import { select } from './gestures/select.ts';
  import { pan } from './gestures/pan.ts';
  import Hand from './hand/Hand.svelte';
  import ContextMenu from './ui/menu/Context.svelte';
  import { ToSVGPointWithPan } from './utils/svg.ts';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import { Init } from './sandbox.ts';
  import { tweened } from 'svelte/motion';
  import { cubicOut, linear } from 'svelte/easing';

  // A Svelte component that can render a game object.
  export let renderer = null;
  export let schema;
  export let state;

  setContext('renderer', renderer);

  let debug = true;
  let svg = { el: null };
  let hand = { el: null };

  let menu = null;
  $: menu = Object.keys($activeObjects).length;

  const { dispatchActions, renderingOrder, stateStore, activeObjects } = Init(
    schema,
    state,
    svg,
    hand
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
  setContext('to-svg-point', ToSVGPoint);

  function CancelSelect() {
    activeObjects.set({});
    menu = false;
  }
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1.0,user-scalable=no" />
</svelte:head>

<span use:drag={{ dispatchActions, svg, panX: $panX, panY: $panY }}>
  <svg
    id="root"
    bind:this={svg.el}
    class="w-full h-full"
    viewBox="{zoomOffsetX}
    {zoomOffsetY}
    {$zoomLevel * cardWidth}
    {$zoomLevel * cardHeight}"
    use:pan={{ panX, panY }}
    use:select={{ panX: $panX, panY: $panY, activeObjects, selectBox, schema, state: $stateStore }}
    use:zoom={{ zoomLevel }}
    on:touchmove|preventDefault={() => {}}
    on:click|self={CancelSelect}
    on:contextmenu|preventDefault={() => {}}
    xmlns="http://www.w3.org/2000/svg">
    <Effects />
    <g transform="translate({$panX}, {$panY})">
      {#each $renderingOrder as id (id)}
        <GameObject {id} />
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

  <div bind:this={hand.el} class="fixed bottom-0 left-0 w-full">
    <Hand ref={hand} hand={$stateStore.objects['hand']} />
  </div>
</span>

{#if menu}
  <div
    transition:fade={{ duration: 200 }}
    class="absolute z-50 left-0 top-0 w-full">
    <ContextMenu {activeObjects} />
  </div>
{/if}

{#if debug}
  <div
    on:wheel|stopPropagation
    class="hidden md:block fixed z-50 top-0 mt-16 overflow-y-auto h-screen
    right-0 bg-white shadow-lg p-8 text-xs">
    <pre>{JSON.stringify($activeObjects, null, 2)}</pre>
    <pre>{JSON.stringify($stateStore, null, 2)}</pre>
  </div>
{/if}
