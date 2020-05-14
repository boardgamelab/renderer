<script>
  import GameObject from './objects/GameObject.svelte';
  import Effects from './Effects.svelte';
  import { drag } from './gestures/drag.ts';
  import { zoom } from './gestures/zoom.ts';
  import { select } from './gestures/select.ts';
  import { pan } from './gestures/pan.ts';
  import ContextMenu from './ui/menu/Context.svelte';
  import { setContext } from 'svelte';
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
  let menu = null;

  $: menu = Object.keys($activeObjects).length;

  const { renderingOrder, stateStore, activeObjects } = Init(
    schema,
    state,
    svg
  );

  // TODO: Need to use something other than card dimensions to
  // determine initial zoom.
  const cardWidth = 600;
  const cardHeight = 720;

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

  const viewportX = tweened(0, {
    duration: 200,
    easing: linear,
  });

  const viewportY = tweened(0, {
    duration: 200,
    easing: linear,
  });

  function CancelSelect() {
    activeObjects.set({});
    menu = false;
  }
</script>

<svg
  id="root"
  bind:this={svg.el}
  class="w-full h-full"
  viewBox="{zoomOffsetX}
  {zoomOffsetY}
  {$zoomLevel * cardWidth}
  {$zoomLevel * cardHeight}"
  use:select={{ activeObjects }}
  use:drag={{ svg }}
  use:zoom={{ zoomLevel }}
  use:pan={{ viewportX, viewportY }}
  on:click|self={CancelSelect}
  on:contextmenu|preventDefault={() => {}}
  xmlns="http://www.w3.org/2000/svg">
  <Effects />
  <g transform="translate({$viewportX}, {$viewportY})">
    {#each $renderingOrder as id (id)}
      <GameObject {id} />
    {/each}
  </g>
</svg>

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
    <pre>{JSON.stringify($stateStore, null, 2)}</pre>
    <pre>{JSON.stringify($activeObjects, null, 2)}</pre>
  </div>
{/if}
