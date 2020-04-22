<script>
  export let position;
  export let schema;
  export let objectID;
  export let template;
  export let isDragging = false;
  export let sizeOffset;

  import { getContext } from 'svelte';
  const renderer = getContext('renderer');

  let { x, y } = $position;
  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  $: {
    x = $position.x;
    y = $position.y;
    width = template.geometry.width + $sizeOffset.dx;
    height = template.geometry.height + $sizeOffset.dy;
  }
</script>

{#if isDragging}
  <rect
    filter="url(#blur)"
    x={x + 30}
    y={y + 30}
    {width}
    {height}
    fill="#111"
    fill-opacity="5%" />
{/if}

<rect {x} {y} {width} {height} {fill} {stroke} />

{#if renderer}
  <svelte:component
    this={renderer}
    {x}
    {y}
    {width}
    {height}
    templates={schema.templates}
    object={schema.objects[objectID]} />
{/if}
