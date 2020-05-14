<script>
  import { getContext } from 'svelte';
  import { Drop, CheckForDrop } from './moveable.ts';
  import { MergeOpts } from '../merge.ts';
  import { tweened } from 'svelte/motion';
  import { Component } from '@boardgamelab/components';

  export let id;
  export let parentPos = null;
  export let draggable = true;
  export let selectable = true;

  const { dispatchActions, state, schema, activeObjects } = getContext(
    'context'
  );

  const position = tweened(null, { duration: 1 });

  let x;
  let y;
  $: {
    const opts = MergeOpts(schema, $state, id);
    x = opts.x || 0;
    y = opts.y || 0;
    position.set({ x, y });
  }

  let isDragging = false;
  let dragged = false;
  function DragStart() {
    isDragging = true;
    dragged = false;

    let toRaise = id;
    if ($state.objects[id].parent) {
      toRaise = $state.objects[id].parent;
    }

    // Raise object so that it appears rendered above
    // other objects while being dragged.
    dispatchActions([
      {
        kind: 'raise',
        id: toRaise,
      },
    ]);
  }

  function RelativeToSVG(pos) {
    if (!pos) {
      return null;
    }

    let dx = 0;
    let dy = 0;

    if ($parentPos) {
      dx = $parentPos.x;
      dy = $parentPos.y;
    }

    return { x: pos.x + dx, y: pos.y + dy };
  }

  function RelativeToParent(pos) {
    if (!pos) {
      return null;
    }

    let dx = 0;
    let dy = 0;

    if ($parentPos) {
      dx = -$parentPos.x;
      dy = -$parentPos.y;
    }

    return { x: pos.x + dx, y: pos.y + dy };
  }

  async function DragEnd() {
    isDragging = false;

    if (!dragged) {
      return;
    }

    const absolutePosition = RelativeToSVG($position);
    const drop = CheckForDrop($state, schema, absolutePosition, id);
    const dropRelativeToParent = RelativeToParent(drop);

    await Drop(
      id,
      drop,
      absolutePosition,
      dropRelativeToParent,
      position,
      dispatchActions,
      activeObjects
    );
  }

  const Drag = ({ detail }) => {
    // TODO: Highlight drop target.
    // const drop = CheckForDrop($state, schema, $position, id);

    dragged = true;

    activeObjects.set({
      [id]: true,
    });

    position.update(p => ({
      x: p.x + detail.dx,
      y: p.y + detail.dy,
    }));
  };

  let active = false;
  $: active = id in $activeObjects;
</script>

{#if $position}
  <g
    transform="translate({$position.x}, {$position.y})"
    data-id={id}
    data-draggable={draggable}
    data-selectable={selectable}
    on:movestart={DragStart}
    on:moveend={DragEnd}
    on:move={Drag}>
    <slot {active} {isDragging} {position} />
  </g>
{/if}
