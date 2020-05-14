<script>
  export let id;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import { selectionColor } from '../../defaults.ts';
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
    {#if active}
      <rect
        x={-10}
        y={-10}
        width={width + 20}
        height={height + 20}
        fill="none"
        stroke-width="10"
        stroke={selectionColor} />
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

    {#if active}
      <g class="cursor-move" transform="translate(-100, -100)">
        <foreignObject width="200" height="200">
          <div class="w-full h-full p-8">
            <div
              style="font-size: 3rem; color: white; background-color: {selectionColor}"
              class="rounded-full shadow-xl w-full h-full flex items-center
              justify-center select-none font-bold text-white">
              {children.length}
            </div>
          </div>
        </foreignObject>
      </g>
    {/if}
  {/if}
</g>
