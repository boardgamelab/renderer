<script>
  import GameObject from './objects/GameObject.svelte';
  import { setContext } from 'svelte';
  import { Init } from './table.ts';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

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
    duration: 400,
    easing: cubicOut,
  });
  let vy = tweened(0, {
    duration: 400,
    easing: cubicOut,
  });

  function Wheel(e) {
    if (e.deltaY > 0) {
      vspan.update(v => v * 1.3);
    } else {
      vspan.update(v => v * 0.7);
    }
  }

  function KeyDown(e) {
    const deltaX = 200;
    const deltaY = 200;

    if (e.key === 's') {
      vy.update(v => v + deltaY);
    }

    if (e.key === 'w') {
      vy.update(v => v - deltaY);
    }

    if (e.key === 'a') {
      vx.update(v => v - deltaX);
    }

    if (e.key === 'd') {
      vx.update(v => v + deltaX);
    }
  }
</script>

<svelte:window on:wheel={Wheel} on:keydown={KeyDown} />

<svg
  id="root"
  bind:this={ref.svg}
  class="w-full h-full"
  viewBox="{$vx}
  {$vy}
  {$vspan}
  {$vspan}"
  on:contextmenu|preventDefault={() => {}}
  on:mousedown={mousedown}
  on:mousemove={mousemove}
  on:mouseup={mouseup}
  xmlns="http://www.w3.org/2000/svg">
  {#each $renderingOrder as id (id)}
    <GameObject {id} />
  {/each}
</svg>
