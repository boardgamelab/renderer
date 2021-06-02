<script>
  export let id;
  export let obj;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import GameObject from '../GameObject.svelte';
  import Size from './Size.svelte';

  const highlight = getContext('highlight');
  const isDragging = getContext('isDragging');
  const { dispatchActions } = getContext('context');

  $: width = obj.stateVal.kind.snap.geometry.width;
  $: height = obj.stateVal.kind.snap.geometry.height;
  $: shape = obj.stateVal.kind.snap.geometry.shape;

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
    {#if shape === "rect"}
      <rect
        in:fade|local={{ duration: 150 }}
        x={0}
        y={0}
        {width}
        {height}
        stroke={id in $highlight ? "#ff8700" : "#000"}
        stroke-width={30}
        stroke-opacity="0.5"
        fill={"#aaa"}
        fill-opacity={id in $highlight ? .3 : 0} />
    {/if}

    {#if shape === "circle"}
      <ellipse
        in:fade|local={{ duration: 150 }}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        stroke={id in $highlight ? "#ff8700" : "#000"}
        stroke-width={30}
        stroke-opacity="0.5"
        fill={"#aaa"}
        fill-opacity={id in $highlight ? .3 : 0} />
    {/if}
  {/if}

  {#if obj.children.length}
    <foreignObject {width} {height}>
      <div class="w-full h-full flex flex-row items-center justify-center">
        {#each obj.children as child, index (child.id)}
          <div animate:flip={{ duration: 100 }} on:mouseenter={() => MouseEnter(index)}>
            <svg width={child.component.layout.geometry.width} height={child.component.layout.geometry.height}>
              <GameObject
                on:movestart={() => MoveStart(index)}
                on:moveend={MoveEnd}
                id={child.id}
                obj={child}
                parentID={id}
                selectable={false}
                droppable={false} />
            </svg>
          </div>
        {/each}
      </div>
    </foreignObject>

    <Size {obj} {width} {height} />
  {/if}
</g>
