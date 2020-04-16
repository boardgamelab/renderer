<script>
  export let x;
  export let y;
  export let schema;
  export let objectID;
  export let template;

  import { getContext } from 'svelte';

  const renderer = getContext('renderer');

  const { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#888';
</script>

<rect {x} {y} {width} {height} {fill} {stroke} />

{#if renderer}
  <svelte:component
    this={renderer}
    {x}
    {y}
    {width}
    {height}
    {schema}
    {objectID} />
{/if}
