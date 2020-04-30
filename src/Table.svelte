<script>
  import GameObject from './objects/GameObject.svelte';
  import Effects from './Effects.svelte';
  import { setContext } from 'svelte';
  import { Init } from './table.ts';
  import { tweened } from 'svelte/motion';
  import { cubicOut, linear } from 'svelte/easing';
  import throttle from 'lodash.throttle';

  // A Svelte component that can render a game object.
  export let renderer = null;
  export let schema;
  export let state;

  setContext('renderer', renderer);

  let ref = { svg: null };

  const {
    mousedown,
    mousemove,
    touchstart,
    touchmove,
    touchend,
    mouseup,
    renderingOrder,
    activeObjectID,
  } = Init(schema, state, ref);

  // TODO: Need to use something other than card dimensions to
  // determine initial zoom.
  const cardWidth = 600;
  const cardHeight = 720;

  const zoom = tweened(4, {
    duration: 200,
    easing: cubicOut,
  });
  const vx = tweened(0, {
    duration: 200,
    easing: linear,
  });
  const vy = tweened(0, {
    duration: 200,
    easing: linear,
  });

  const MAX_ZOOM = 7;
  const MIN_ZOOM = 2;
  let zoomOffsetX = 0;
  let zoomOffsetY = 0;
  $: {
    zoomOffsetX = (cardWidth * (1 - $zoom)) / 2;
    zoomOffsetY = (cardHeight * (1 - $zoom)) / 2;
  }

  function Wheel(e) {
    if (e.deltaY > 0) {
      zoom.update(v => Math.min(v * 1.3, MAX_ZOOM));
    } else {
      zoom.update(v => Math.max(v * 0.7, MIN_ZOOM));
    }
  }

  const KeyDown = throttle(
    e => {
      const deltaX = 1000;
      const deltaY = 1000;

      if (e.key === 's') {
        vy.update(v => v - deltaY);
      }

      if (e.key === 'w') {
        vy.update(v => v + deltaY);
      }

      if (e.key === 'a') {
        vx.update(v => v + deltaX);
      }

      if (e.key === 'd') {
        vx.update(v => v - deltaX);
      }
    },
    200,
    { leading: true }
  );
</script>

<svelte:window on:wheel={Wheel} on:keydown={KeyDown} />
<div class="absolute top-0 text-center w-full bg-gray-100 p-2">
  Drag your cards around here. This will eventually become a more sophisticated
  virtual table with multiplayer features.
</div>
<svg
  id="root"
  bind:this={ref.svg}
  class="w-full h-full"
  viewBox="{zoomOffsetX}
  {zoomOffsetY}
  {$zoom * cardWidth}
  {$zoom * cardHeight}"
  on:contextmenu|preventDefault={() => {}}
  on:mousedown={mousedown}
  on:mousemove={mousemove}
  on:touchstart={touchstart}
  on:touchend={touchend}
  on:touchmove={touchmove}
  on:mouseup={mouseup}
  xmlns="http://www.w3.org/2000/svg">
  <Effects />
  <g transform="translate({$vx}, {$vy})">
    {#each $renderingOrder as id (id)}
      <GameObject {id} />
    {/each}
  </g>
</svg>
