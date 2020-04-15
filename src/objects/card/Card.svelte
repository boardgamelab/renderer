<script>
  export let x;
  export let y;
  export let schema;
  export let style = {};
  export let objectID;

  import { getContext } from 'svelte';

  const renderer = getContext('renderer');

  const width = style.width || 150;
  const height = style.height || 200;
  const fill = style.fill || '#eee';
  const stroke = style.stroke || '#888';

  // import img from './cards.svg';
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
