<script>
  export let state;
  export let stateEntry;
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

  let topCard = null;
  let numCards = 0;

  $: {
    numCards = 0;
    topCard = null;

    x = $position.x;
    y = $position.y;
    width = template.geometry.width + $sizeOffset.dx;
    height = template.geometry.height + $sizeOffset.dy;

    if (stateEntry.parent) {
      const parent = state.objects[stateEntry.parent];
      if (parent.children[parent.children.length - 1] === objectID) {
        topCard = objectID;
      }
    } else {
      topCard = objectID;
    }

    if (stateEntry.children && stateEntry.children.length) {
      numCards = stateEntry.children.length + 1;

      if (stateEntry.children.length === 1) {
        topCard = objectID;
      }

      if (stateEntry.children.length > 1) {
        topCard = stateEntry.children[stateEntry.children.length - 2];
      }
    }
  }
</script>

{#if topCard}
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
      object={schema.objects[topCard]} />
  {/if}

  {#if numCards}
    <text
      class="select-none"
      style="font: bold 80px monospace"
      x={x + width / 2 - 50}
      y={y + height + 100}
      fill="#aaa">
      x{numCards}
    </text>
  {/if}
{/if}
