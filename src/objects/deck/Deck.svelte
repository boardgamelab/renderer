<script>
  export let id;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import Moveable from '../Moveable.svelte';
  import Card from '../card/Card.svelte';

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
      transform="translate({width / 2 - 75}, {height + 50})">

      <svg
        width="150"
        height="150"
        viewBox="0 0 136 136"
        xmlns="http://www.w3.org/2000/svg">
        <g
          transform="translate(0 -162)"
          fill="#fff"
          stroke="#4f4f4f"
          stroke-width="7.9">
          <rect
            transform="rotate(11)"
            x="90"
            y="158"
            width="74"
            height="88"
            ry="13.6" />
          <rect x="8" y="196" width="74" height="88" ry="13.6" />
        </g>
      </svg>
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

    {#each children.slice(-2) as child (child)}
      <Moveable
        id={child}
        selectable={false}
        parentPos={position}
        let:active
        let:isDragging>
        <Card id={child} {isDragging} {active} />
      </Moveable>
    {/each}
  {/if}
</g>
