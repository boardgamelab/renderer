<script>
  export let id;
  export let obj;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../defaults.ts';
  import GameObject from '../GameObject.svelte';
  import Size from './Size.svelte';

  const highlight = getContext('highlight');

  let width = 0;
  let height = 0;

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

      if (firstChild.component) {
        const { width: w, height: h } = firstChild.component.layout.geometry;

        if (w) {
          width = w;
        }

        if (h) {
          height = h;
        }
      }
    }
  }
</script>

<g
  data-id={id}
  data-selectable="true"
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

    {#each obj.children.slice(-10) as child (child.id)}
      <GameObject
        id={child.id}
        obj={child}
        parentID={id}
        selectable={false}
        droppable={false} />
    {/each}

    <Size {obj} {width} {height} />
  {/if}
</g>
