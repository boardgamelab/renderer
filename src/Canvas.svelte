<script>
  import GameObject from './objects/GameObject.svelte';
  import { Init } from './canvas.ts';

  export let schema;
  export let state;

  let ref = { svg: null };

  const {
    mousedown,
    mousemove,
    mouseup,
    renderingOrder,
    activeObjectID,
  } = Init(schema, state, ref);
</script>

<style>
  .root {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
</style>

<svg
  id="root"
  class="root"
  bind:this={ref.svg}
  viewBox="0 0 1000 1000"
  on:mousedown={mousedown}
  on:mousemove={mousemove}
  on:mouseup={mouseup}
  xmlns="http://www.w3.org/2000/svg">
  {#each $renderingOrder as id (id)}
    <GameObject {id} />
  {/each}
</svg>
