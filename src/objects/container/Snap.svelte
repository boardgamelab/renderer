<script>
  export let id;
  export let obj;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import GameObject from '../GameObject.svelte';
  import {ghost } from "../../ghost/ghost.ts";
  import Size from './Size.svelte';

  const highlight = getContext('highlight');
  const isDragging = getContext('isDragging');
  const { activeObjects, dispatchActions } = getContext('context');

  $: width = obj.stateVal.kind.snap.geometry.width;
  $: height = obj.stateVal.kind.snap.geometry.height;
  $: shape = obj.stateVal.kind.snap.geometry.shape;
  $: kind = obj.stateVal.kind.snap.kind;
  $: active = id in $activeObjects;

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

  let hide = false;

  function Hide() {
    hide = true;
  }

  function Show() {
    hide = false;
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
  data-draggable="true"
  class:hide
  use:ghost={{ id, isSnap: true, onTable: true, highlight, activeObjects, dispatchActions }}
  on:hide={Hide}
  on:show={Show}
  transform="rotate({$rotation}, {width / 2}, {height / 2})">

  {#if $isDragging || id in $highlight}
    {#if shape === "rect"}
      <rect
        in:fade|local={{ duration: 150 }}
        x={0}
        y={0}
        {width}
        {height}
        stroke="#ff8700"
        stroke-width={50}
        stroke-opacity={id in $highlight ? .8 : 0}
        fill={"transparent"} />
    {/if}

    {#if shape === "circle" || shape === "hex"}
      <ellipse
        in:fade|local={{ duration: 150 }}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        stroke="#ff8700"
        stroke-width={50}
        stroke-opacity={id in $highlight ? .8 : 0}
        fill={"transparent"} />
    {/if}
  {/if}

  {#if obj.children.length}
    {#if kind === "row"}
      <foreignObject class="overflow-visible" {width} {height}>
        <div class="w-full h-full flex flex-row items-center justify-center">
          {#each obj.children as child, index (child.id)}
            <div class="mx-10" animate:flip={{ duration: 100 }} on:mouseenter={() => MouseEnter(index)}>
              <svg class="overflow-visible" width={child.component.layout.geometry.width} height={child.component.layout.geometry.height}>
                <GameObject
                  on:movestart={() => MoveStart(index)}
                  on:moveend={MoveEnd}
                  id={child.id}
                  obj={child}
                  parentID={id}
                  selectable={true}
                  droppable={false} />
              </svg>
            </div>
          {/each}
        </div>
      </foreignObject>
    {/if}

    <!-- A bug with absolute / relative positioning
         (which is what would be required to position things on top of
         each other) causes flickering when used inside a foreignObject.
         So, we just continue using SVG here instead.
         https://bugs.webkit.org/show_bug.cgi?id=23113 -->
    {#if kind === "stack"}
      <g>
        {#each obj.children.slice(-10) as child (child.id)}
          <GameObject
            id={child.id}
            obj={child}
            parentID={id}
            selectable={true}
            anchor={{ x: width / 2, y: height / 2 }}
            droppable={false} />
        {/each}
      </g>
    {/if}

    {#if kind === "stack"}
    <Size {obj} {width} {height} highlight={id in $highlight || active} />
    {/if}
  {/if}
</g>

<style>
  .hide {
    @apply opacity-0 pointer-events-none;
  }
</style>
