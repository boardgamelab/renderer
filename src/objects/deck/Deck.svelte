<script>
  export let id;
  export let position;
  export let sizeOffset;
  export let isDragging;

  import { getContext } from 'svelte';
  import GameObject from '../GameObject.svelte';
  import Card from '../card/Card.svelte';
  import { fly } from 'svelte/transition';

  const { schema, state } = getContext('context');
  const { templateID } = schema.objects[id];
  const template = schema.templates[templateID];
  let { x, y } = $position;
  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  let numCards = 0;
  let children = [];
  $: {
    x = $position.x;
    y = $position.y;
    width = template.geometry.width + $sizeOffset.dx;
    height = template.geometry.height + $sizeOffset.dy;
    children = $state.objects[id].children || [];
    numCards = children.length + 1;
  }
</script>

{#if children.length}
  {#if numCards}
    <text
      in:fly={{ duration: 200, y: -100 }}
      class="select-none"
      style="font: bold 80px monospace"
      x={x + width / 2 - 50}
      y={y + height + 100}
      fill="#aaa">
      x{numCards}
    </text>
  {/if}

  <Card {id} {position} {sizeOffset} {isDragging} />

  {#each children as child (child)}
    <GameObject id={child} parentPosition={position} />
  {/each}
{/if}
