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
  const { dispatchActions } = getContext('context');

  $: width = obj.stateVal.kind.snap.geometry.width;
  $: height = obj.stateVal.kind.snap.geometry.height;

  const rotation = tweened(0, { duration: 200 });

  async function ShuffleAnimation() {
    await rotation.update((r) => r + 359);
    await rotation.set(0, { duration: 1 });
  }

  let movedIndex = null;
  let swapTarget = null;

  function MoveStart(index) {
    movedIndex = index;
  }

  function MoveEnd() {
    movedIndex = null;
    swapTarget = null;
  }

  function MouseEnter(index) {
    ElementEnter(index);
  }

  let shuffleID = null;
  $: {
    const newID = obj.stateVal.shuffleID;
    if (newID && newID !== shuffleID) {
      ShuffleAnimation();
      shuffleID = newID;
    }
  }

  function ElementEnter(index) {
    if (movedIndex === null || movedIndex === index || index === swapTarget) {
      return;
    }

    swapTarget = index;

    let indices = [...Array(obj.children.length).keys()];

    indices[movedIndex] = index;
    indices[index] = movedIndex;

    movedIndex = index;

    dispatchActions([
      {
        context: {
          subject: { id },
        },
        type: 'container',
        reorder: {
          children: indices,
        },
      },
    ]);
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
    {#each obj.children as child, index (child.id)}
      <g on:mouseenter={() => MouseEnter(index)}>
        <GameObject
          on:movestart={() => MoveStart(index)}
          on:moveend={MoveEnd}
          id={child.id}
          obj={child}
          parentID={id}
          anchor={{
            x: width / 2,
            y: height/ 2,
            index
          }}
          selectable={false}
          droppable={false} />
      </g>
    {/each}

    <Size {obj} {width} {height} />
  {/if}
</g>
