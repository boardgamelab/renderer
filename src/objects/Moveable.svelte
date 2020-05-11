<script>
  import { getContext } from 'svelte';
  import { CheckForDrop } from './moveable.ts';
  import { MergeOpts } from '../merge.ts';
  import { tweened } from 'svelte/motion';

  export let id;
  export let parentPos = null;

  const { dispatchAction, state, schema, activeObjects } = getContext(
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
  function DragStart() {
    isDragging = true;

    let toRaise = id;
    if ($state.objects[id].parent) {
      toRaise = $state.objects[id].parent;
    }
    // Raise object so that it appears rendered above
    // other objects while being dragged.
    const action = {
      kind: 'raise',
      id: toRaise,
    };

    dispatchAction(action);
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

  async function DragEnd() {
    isDragging = false;

    const absolutePosition = RelativeToSVG($position);
    const drop = CheckForDrop($state, schema, absolutePosition, id);
    const dropRelativeToParent = RelativeToParent(drop);

    if (drop) {
      await position.set(
        {
          x: dropRelativeToParent.x,
          y: dropRelativeToParent.y,
        },
        { duration: 150 }
      );

      dispatchAction({
        kind: 'opts',
        id,
        key: 'x',
        value: 0,
      });

      dispatchAction({
        kind: 'opts',
        id,
        key: 'y',
        value: 0,
      });

      if (!drop.originalParent) {
        dispatchAction({
          kind: 'add-to',
          id,
          parent: drop.id,
        });
      }
    } else {
      dispatchAction({
        kind: 'opts',
        id,
        key: 'x',
        value: absolutePosition.x,
      });

      dispatchAction({
        kind: 'opts',
        id,
        key: 'y',
        value: absolutePosition.y,
      });

      dispatchAction({
        kind: 'add-to',
        id,
        parent: null,
      });
    }
  }

  const Drag = ({ detail }) => {
    // TODO: Highlight drop target.
    // const drop = CheckForDrop($state, schema, $position, id);

    position.update(p => ({
      x: p.x + detail.dx,
      y: p.y + detail.dy,
    }));
  };

  let active = false;
  $: active = id in $activeObjects;

  function Select(e) {
    activeObjects.update(v => ({ [id]: true }));
  }
</script>

{#if $position}
  <g
    transform="translate({$position.x}, {$position.y})"
    {id}
    data-draggable="true"
    data-selectable="true"
    on:movestart={DragStart}
    on:moveend={DragEnd}
    on:move={Drag}
    on:select={Select}>
    <slot {active} {isDragging} {position} />
  </g>
{/if}
