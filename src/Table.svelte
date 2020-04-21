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
    mouseup,
    renderingOrder,
    activeObjectID,
  } = Init(schema, state, ref);

  let vspan = tweened(4000, {
    duration: 200,
    easing: cubicOut,
  });
  let vx = tweened(0, {
    duration: 200,
    easing: linear,
  });
  let vy = tweened(0, {
    duration: 200,
    easing: linear,
  });

  function Wheel(e) {
    if (e.deltaY > 0) {
      vspan.update(v => v * 1.3);
    } else {
      vspan.update(v => v * 0.7);
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
<svg
  id="root"
  bind:this={ref.svg}
  class="w-full h-full"
  viewBox="{0}
  {0}
  {$vspan}
  {$vspan}"
  on:contextmenu|preventDefault={() => {}}
  on:mousedown={mousedown}
  on:mousemove={mousemove}
  on:mouseup={mouseup}
  xmlns="http://www.w3.org/2000/svg">
  <Effects />
  <g transform="translate({$vx}, {$vy})">
    {#each $renderingOrder as id (id)}
      <GameObject {id} />
    {/each}
  </g>
</svg>
