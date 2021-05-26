<script>
  export let id;
  export let obj;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade, fly } from 'svelte/transition';
  import { selectionColor } from '../../defaults.ts';
  import GameObject from '../GameObject.svelte';

  const highlight = getContext('highlight');
  const isDragging = getContext('isDragging');

  $: width = obj.stateVal.template.layout.geometry.width;
  $: height = obj.stateVal.template.layout.geometry.height;

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
</script>

<g
  data-id={id}
  data-selectable="true"
  data-droppable="true"
  transform="rotate({$rotation}, {width / 2}, {height / 2})">

  {#if $isDragging}
    <rect
      in:fade|local={{ duration: 150 }}
      x={0}
      y={0}
      {width}
      {height}
      fill={selectionColor}
      fill-opacity="0.4"
      stroke-width="10"
      stroke={selectionColor} />
  {/if}

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

    {#each obj.children as child (child.id)}
      <GameObject id={child.id} obj={child} />
    {/each}

    {#if obj.children.length > 1}
    <g class="cursor-move" in:fly={{ duration: 250, y: -100 }}>
      <foreignObject
        x={width / 2 - 100}
        y={height + 20}
        width="200"
        height="200">
        <div class="w-full h-full p-8">
          <div
            style="font-size: 3rem"
            class="text-gray-600 bg-white rounded-full shadow-xl w-full h-full
            flex items-center justify-center select-none font-bold text-white">
            {obj.children.length}
          </div>
        </div>
      </foreignObject>
    </g>
    {/if}
  {/if}
</g>
