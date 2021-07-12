<script>
  export let id;
  export let obj;

  import { FlatTopHexPointsStr } from '../../utils/hex.ts';
  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import GameObject from '../GameObject.svelte';
  import SnapRowCol from './SnapRowCol.svelte';
  import { ghost } from '../../ghost/ghost.ts';
  import Size from './Size.svelte';

  const highlight = getContext('highlight');
  const isDragging = getContext('isDragging');
  const { activeObjects, dispatchActions } = getContext('context');

  $: width = obj.stateVal.kind.snap.geometry.width;
  $: height = obj.stateVal.kind.snap.geometry.height;
  $: shape = obj.stateVal.kind.snap.geometry.shape;
  $: kind = obj.stateVal.kind.snap.kind;
  $: limit = obj.stateVal.kind.snap.limit;
  $: active = id in $activeObjects;
  $: types = obj.stateVal.types
    .map((t) => {
      if (t.component) return t.component;
      if (t.trait) return t.trait;
      return t;
    })
    .join(' ');

  $: isFull = limit !== null && obj.children.length >= limit;

  const rotation = tweened(0, { duration: 100 });

  async function ShuffleAnimation() {
    await rotation.update((r) => r + 25, { duration: 100 });
    await rotation.update((r) => r - 50, { duration: 100 });
    await rotation.update((r) => r + 50, { duration: 100 });
    await rotation.update((r) => r - 25, { duration: 100 });
  }

  let shuffleID = obj.stateVal.shuffleID;
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
</script>

<g
  data-id={id}
  data-selectable="true"
  data-droppable={!isFull && 'true'}
  data-draggable={kind === 'stack'}
  data-types={types}
  class:hide
  use:ghost={{
    id,
    isSnap: true,
    onTable: true,
    highlight,
    activeObjects,
    dispatchActions,
  }}
  on:hide={Hide}
  on:show={Show}
  transform="translate({$rotation * 2}) rotate({$rotation}, {width /
    2}, {height / 2})"
>
  <!-- TODO: Move Frame.svelte into renderer (or pass it through setContext) -->
  {#if $isDragging || id in $highlight}
    {#if shape === 'rect'}
      <rect
        in:fade|local={{ duration: 150 }}
        x={0}
        y={0}
        {width}
        {height}
        stroke="#ff8700"
        stroke-width={50}
        stroke-opacity={id in $highlight ? 0.8 : 0}
        fill={'transparent'}
      />
    {/if}

    {#if shape === 'circle'}
      <ellipse
        in:fade|local={{ duration: 150 }}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        stroke="#ff8700"
        stroke-width={50}
        stroke-opacity={id in $highlight ? 0.8 : 0}
        fill={'transparent'}
      />
    {/if}

    {#if shape === 'hex'}
      <polygon
        points={FlatTopHexPointsStr(width, height)}
        stroke="#ff8700"
        stroke-width={50}
        stroke-opacity={id in $highlight ? 0.8 : 0}
        fill={'transparent'}
      />
    {/if}
  {/if}

  {#if obj.children.length}
    {#if kind === 'row' || kind === 'column'}
      <foreignObject class="overflow-visible" {width} {height}>
        <SnapRowCol gap="large" center={true} {id} {obj} {kind} />
      </foreignObject>
    {/if}

    <!-- A bug with absolute / relative positioning
         (which is what would be required to position things on top of
         each other) causes flickering when used inside a foreignObject.
         So, we just continue using SVG here instead.
         https://bugs.webkit.org/show_bug.cgi?id=23113 -->
    {#if kind === 'stack'}
      <g>
        {#each obj.children.slice(-10) as child (child.id)}
          <GameObject
            id={child.id}
            obj={child}
            parentID={id}
            selectable={true}
            anchor={{ x: width / 2, y: height / 2 }}
            droppable={false}
          />
        {/each}
      </g>
    {/if}

    {#if kind === 'stack'}
      <Size {obj} {width} {height} highlight={id in $highlight || active} />
    {/if}
  {/if}
</g>

<style>
  .hide {
    @apply opacity-0 pointer-events-none;
  }
</style>
