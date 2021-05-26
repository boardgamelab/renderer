<script>
  export let id;
  export let obj;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../defaults.ts';
  import GameObject from '../GameObject.svelte';
  import Size from './Size.svelte';

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

  {#if $isDragging || id in $highlight}
    <rect
      in:fade|local={{ duration: 150 }}
      x={0}
      y={0}
      {width}
      {height}
      fill={selectionColor}
      fill-opacity={id in $highlight ? 0.5 : 0}
      stroke-width="10"
      stroke={selectionColor} />
  {/if}

  {#if obj.children.length}
    {#each obj.children as child (child.id)}
      <GameObject id={child.id} obj={child} selectable={false} droppable={false} />
    {/each}

    <Size {obj} {width} {height} />
  {/if}
</g>
