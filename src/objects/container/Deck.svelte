<script>
  export let id;
  export let obj;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../defaults.ts';
  import Moveable from '../Moveable.svelte';
  import Card from '../tile/card/Card.svelte';
  import Size from './Size.svelte';

  const highlight = getContext('highlight');
  let { width, height } = obj.component.layout.geometry;

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

    if (obj.component.layout.geometry.width) {
      width = obj.component.layout.geometry.width;
    }

    if (obj.component.layout.geometry.height) {
      height = obj.component.layout.geometry.height;
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

    {#each obj.children as child (child.id)}
      <Moveable
        id={child.id}
        obj={child}
        parentID={id}
        let:active
        let:isDragging>
        <Card
          id={child.id}
          obj={child}
          selectable={false}
          droppable={false}
          {isDragging}
          {active} />
      </Moveable>
    {/each}

    <Size {obj} {width} {height} />
  {/if}
</g>
