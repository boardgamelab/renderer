<script>
  export let id;
  export let position;
  export let isDragging = false;
  export let sizeOffset;

  import { getContext } from 'svelte';

  const { schema } = getContext('context');
  const renderer = getContext('renderer');

  const { templateID } = schema.objects[id];
  const template = schema.templates[templateID];

  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  $: {
    width = template.geometry.width + $sizeOffset.dx;
    height = template.geometry.height + $sizeOffset.dy;
  }
</script>

{#if isDragging}
  <rect
    filter="url(#blur)"
    x={$position.x + 30}
    y={$position.y + 30}
    {width}
    {height}
    fill="#111"
    fill-opacity="5%" />
{/if}

<rect
  data-id={id}
  x={$position.x}
  y={$position.y}
  {width}
  {height}
  {fill}
  {stroke} />

{#if renderer}
  <svelte:component
    this={renderer}
    x={$position.x}
    y={$position.y}
    {width}
    {height}
    templates={schema.templates}
    object={schema.objects[id]} />
{/if}
