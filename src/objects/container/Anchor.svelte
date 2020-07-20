<script>
  export let id;
  export let obj;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { selectionColor } from '../../defaults.ts';
  import Moveable from '../Moveable.svelte';
  import Card from '../tile/card/Card.svelte';

  const renderer = getContext('renderer');
  const schema = getContext('schema');
  const highlight = getContext('highlight');

  const template = obj.template;
  const width = template.geometry.width;
  const height = template.geometry.height;

  const rotation = tweened(0, { duration: 200 });

  async function ShuffleAnimation() {
    await rotation.update((r) => r + 359);
    await rotation.set(0, { duration: 1 });
  }

  let shuffleID = null;
  $: {
    const newID = obj.stateVal.shuffleID;
    if (newID && newID !== shuffleID) {
      ShuffleAnimation();
      shuffleID = newID;
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

  {#if obj.children.length}
    {#each obj.children.slice(-2) as child (child.id)}
      <Moveable
        id={child.id}
        obj={child}
        selectable={false}
        parentPos={position}
        let:active
        let:isDragging>
        <Card
          id={child.id}
          obj={child}
          droppable={false}
          {isDragging}
          {active} />
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
              {obj.children.length}
            </div>
          </div>
        </foreignObject>
      </g>
    {/if}
  {/if}
</g>
