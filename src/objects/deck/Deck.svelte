<script>
  export let id;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import Moveable from '../Moveable.svelte';
  import Card from '../card/Card.svelte';
  import { fly } from 'svelte/transition';

  const { schema, state } = getContext('context');
  const { template } = $state.objects[id];
  let { x, y } = $position;
  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  let children = [];
  $: {
    x = $position.x;
    y = $position.y;
    width = template.geometry.width;
    height = template.geometry.height;
    children = $state.objects[id].children || [];
  }
</script>

<g>
  {#if children.length}
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
        {children.length}
      </text>
    </g>

    {#if active}
      <rect
        x={-10}
        y={-10}
        width={width + 20}
        height={height + 20}
        fill="none"
        stroke-width="10"
        stroke="#37c3ec" />
    {/if}

    {#each children as child (child)}
      <Moveable id={child} parentPos={position} let:active let:isDragging>
        <Card id={child} {isDragging} {active} />
      </Moveable>
    {/each}
  {/if}
</g>
