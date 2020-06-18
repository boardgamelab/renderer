<script>
  export let id;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { selectionColor } from '../../defaults.ts';
  import Moveable from '../Moveable.svelte';
  import Card from '../tile/card/Card.svelte';

  const renderer = getContext('renderer');
  const schema = getContext('schema');
  const { state } = getContext('context');
  const highlight = getContext('highlight');
  const { template } = $state.objects[id];
  let { x, y } = $position;
  let width = 0;
  let height = 0;
  const fill = '#fff';
  const stroke = '#111';

  const rotation = tweened(0, { duration: 200 });

  async function ShuffleAnimation() {
    await rotation.update(r => r + 359);
    await rotation.set(0, { duration: 1 });
  }

  let shuffleID = null;
  let children = [];
  $: {
    if (id in $schema.objects) {
      const { templateID } = $schema.objects[id];
      const template = $schema.templates[templateID];
      width = template.geometry.width;
      height = template.geometry.height;
    }

    if (id in $state.objects) {
      const newID = $state.objects[id].shuffleID;
      if (newID && newID !== shuffleID) {
        ShuffleAnimation();
        shuffleID = newID;
      }
      children = $state.objects[id].children || [];
    }
  }

  $: {
    x = $position.x;
    y = $position.y;
  }
</script>

<g
  data-id={id}
  data-droppable="true"
  transform="rotate({$rotation}, {width / 2}, {height / 2})">
  <rect
    x={10}
    y={10}
    width={width - 20}
    height={height - 20}
    fill="#fff"
    stroke="#aaa"
    stroke-width="10"
    stroke-dasharray="50,25" />

  {#if renderer && id in $schema.objects}
    <svelte:component
      this={renderer}
      {width}
      {height}
      templates={$schema.templates}
      object={$schema.objects[id]} />
  {/if}

  {#if children.length}
    {#if id in $highlight || active}
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
