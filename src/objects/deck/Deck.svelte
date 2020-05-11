<script>
  export let id;
  export let position;
  export let isDragging = false;
  export let active = false;

  import { getContext } from 'svelte';
  import GameObject from '../GameObject.svelte';
  import Card from '../card/Card.svelte';
  import { fly } from 'svelte/transition';

  const { activate } = getContext('menu');
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

<g
  on:click={() => {
    activate();
  }}>
  {#if children.length}
    {#if numCards}
      <text
        in:fly={{ duration: 200, y: -100 }}
        class="select-none"
        style="font: bold 80px monospace"
        x={width / 2 - 50}
        y={height + 100}
        fill="#aaa">
        x{numCards}
      </text>
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
      <GameObject id={child} parentPostion={position} />
    {/each}
  {/if}
</g>
