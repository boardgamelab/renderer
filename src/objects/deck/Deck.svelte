<script>
  export let id;
  export let position;
  export let isDragging = false;
  export let active = false;

  import { getContext } from 'svelte';
  import Moveable from '../Moveable.svelte';
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
    width = template.geometry.width;
    height = template.geometry.height;
    children = $state.objects[id].children || [];
    numCards = children.length + 1;
  }
</script>

<g>
  {#if children.length}
    {#if numCards}
      <g
        class="cursor-move"
        transform="translate({width / 2}, {height + 150})"
        in:fly={{ duration: 200, y: -100, opacity: 1 }}>
        <circle r="100" height="50" fill="#ddd" />
        <text
          y="30"
          text-anchor="middle"
          class="select-none"
          style="font: bold 80px monospace"
          fill="#888">
          {numCards}
        </text>
      </g>
    {/if}

    {#if active}
      <rect
        x={-10}
        y={-10}
        width={width + 20}
        height={height + 20}
        fill="none"
        stroke-width="10"
        stroke="#43d8c9" />
    {/if}

    <Card {id} {isDragging} />

    {#each children as child (child)}
      <Moveable id={child} parentPos={position} let:active let:isDragging>
        <Card id={child} {isDragging} {active} />
      </Moveable>
    {/each}
  {/if}
</g>
