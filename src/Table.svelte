<script>
  import GameObject from './objects/GameObject.svelte';
  import { setContext } from 'svelte';
  import { Init } from './canvas.ts';
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

  let vspan = tweened(1000, {
    duration: 200,
    easing: cubicOut,
  });
  let vx = tweened(0, {
    duration: 200,
    easing: cubicOut,
  });
  let vy = tweened(0, {
    duration: 200,
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
    const deltaX = 100;
    const deltaY = 100;

    if (e.key === 'j') {
      vy.update(v => v + deltaY);
    }

    if (e.key === 'k') {
      vy.update(v => v - deltaY);
    }

    if (e.key === 'h') {
      vx.update(v => v - deltaX);
    }

    if (e.key === 'l') {
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
  on:mousedown={mousedown}
  on:mousemove={mousemove}
  on:mouseup={mouseup}
  xmlns="http://www.w3.org/2000/svg">
  {#each $renderingOrder as id (id)}
    <GameObject {id} />
  {/each}
</svg>
