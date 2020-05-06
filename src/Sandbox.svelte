<script>
  import GameObject from './objects/GameObject.svelte';
  import Effects from './Effects.svelte';
  import { zoom } from './gestures/zoom.ts';
  import { pan } from './gestures/pan.ts';
  import { setContext } from 'svelte';
  import { Init } from './sandbox.ts';
  import { tweened } from 'svelte/motion';
  import { cubicOut, linear } from 'svelte/easing';

  // A Svelte component that can render a game object.
  export let renderer = null;
  export let schema;
  export let state;

  setContext('renderer', renderer);

  let svg = { el: null };

  const { renderingOrder, stateStore } = Init(schema, state, svg);

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
</script>

<div class="absolute top-0 text-center w-full bg-gray-100 p-2">
  Drag your cards around here. This will eventually become a more sophisticated
  virtual table with multiplayer features.
</div>
<svg
  id="root"
  bind:this={svg.el}
  class="w-full h-full"
  viewBox="{zoomOffsetX}
  {zoomOffsetY}
  {$zoomLevel * cardWidth}
  {$zoomLevel * cardHeight}"
  use:zoom={{ zoomLevel }}
  use:pan={{ viewportX, viewportY }}
  on:contextmenu|preventDefault={() => {}}
  xmlns="http://www.w3.org/2000/svg">
  <Effects />
  <g transform="translate({$viewportX}, {$viewportY})">
    {#each $renderingOrder as id (id)}
      <GameObject {id} />
    {/each}
  </g>
</svg>

<div
  on:wheel|stopPropagation
  class="fixed z-50 top-0 overflow-y-auto h-screen right-0 bg-white shadow-lg
  p-8 text-xs">
  <pre>{JSON.stringify(schema, null, 2)}</pre>
  <pre>{JSON.stringify($stateStore, null, 2)}</pre>
</div>
