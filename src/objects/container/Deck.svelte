<script>
  export let id;
  export let obj;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../defaults.ts';
  import Moveable from '../Moveable.svelte';
  import Card from '../tile/card/Card.svelte';

  const highlight = getContext('highlight');
  let { width, height } = obj.template.geometry;

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

    if (obj.children.length) {
      const firstChild = obj.children[0];
      const { width: w, height: h } = firstChild.template.geometry;

      if (w) {
        width = w;
      }

      if (h) {
        height = h;
      }
    }

    if (obj.template.geometry.width) {
      width = obj.template.geometry.width;
    }

    if (obj.template.geometry.height) {
      height = obj.template.geometry.height;
    }
  }
</script>

<g
  data-id={id}
  data-droppable="true"
  transform="rotate({$rotation}, {width / 2}, {height / 2})">
  {#if obj.children.length}
    {#if id in $highlight || active}
      <rect
        in:fade|local={{ duration: 150 }}
        x={-10}
        y={-10}
        width={width + 20}
        height={height + 20}
        fill="none"
        stroke-width="10"
        stroke={selectionColor} />
    {/if}

    {#each obj.children.slice(-2) as child (child.id)}
      <Moveable
        id={child.id}
        obj={child}
        selectable={false}
        parentID={id}
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
