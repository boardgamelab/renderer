<script>
  import { getContext } from 'svelte';
  import { Drop, CheckForDrop } from './moveable.ts';
  import { tweened } from 'svelte/motion';
  import { send, receive } from './crossfade.js';

  export let id;
  export let parentPos = null;
  export let draggable = true;
  export let selectable = true;

  const { hand, dispatchActions, state, activeObjects } = getContext('context');

  const schema = getContext('schema');
  const highlight = getContext('highlight');
  const toSVGPoint = getContext('to-svg-point');
  const position = tweened(null, { duration: 0 });

  let x, absoluteX;
  let y, absoluteY;
  let prevParent = null;

  $: {
    if (id in $state.objects) {
      const newX = $state.objects[id].x || 0;
      const newY = $state.objects[id].y || 0;

      let changed = false;
      if (newX !== x || newY !== y) {
        changed = true;
      }

      absoluteX = x = newX;
      absoluteY = y = newY;

      const currParent = $state.objects[id].parent || null;

      if (currParent in $state.objects) {
        absoluteX += $state.objects[currParent].x || 0;
        absoluteY += $state.objects[currParent].y || 0;
      }

      if (changed) {
        if ($state.remote && !currParent && !prevParent) {
          position.set({ x, y }, { duration: 150 });
        } else {
          position.set({ x, y });
        }
      }

      prevParent = currParent;
    }
  }

  let isDragging = false;
  let dragged = false;
  let snapshot = null;
  function DragStart() {
    dragged = false;

    snapshot = $position;

    let toRaise = id;
    if ($state.objects[id].parent) {
      toRaise = $state.objects[id].parent;
    }

    // Raise object so that it appears rendered above
    // other objects while being dragged.
    // TODO: Use a ghost and stop calling "raise" here.
    dispatchActions([
      {
        type: 'raise',
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

    highlight.set({});

    if (!dragged) {
      return;
    }

    const absolutePosition = RelativeToSVG($position);
    const drop = CheckForDrop(
      $state,
      $schema,
      absolutePosition,
      id,
      hand,
      toSVGPoint
    );
    const dropRelativeToParent = RelativeToParent(drop);

    if (drop) {
      await position.set(
        {
          x: dropRelativeToParent.x,
          y: dropRelativeToParent.y,
        },
        { duration: 150 }
      );
    }

    Drop(id, drop, absolutePosition, dispatchActions, activeObjects);
  }

  const Drag = ({ detail }) => {
    const absolutePosition = RelativeToSVG($position);
    const drop = CheckForDrop(
      $state,
      $schema,
      absolutePosition,
      id,
      hand,
      toSVGPoint
    );

    let h = {};
    if (drop && !drop.targetIsCurrentParent) {
      h = {
        [drop.targetID]: true,
      };
    }
    highlight.set(h);

    dragged = true;
    isDragging = true;

    activeObjects.set({
      [id]: true,
    });

    position.set({
      x: snapshot.x + detail.svg.dx,
      y: snapshot.y + detail.svg.dy,
    });
  };

  $: inContainer = parentPos !== null;

  let active = false;
  $: active = id in $activeObjects;
</script>

<g
  transform="translate({$position.x}, {$position.y})"
  out:send={{ key: id, x: absoluteX, y: absoluteY, inContainer, animate: $state.remote }}
  in:receive={{ key: id, x: absoluteX, y: absoluteY, inContainer, animate: $state.remote }}
  data-id={id}
  data-draggable={draggable}
  data-selectable={selectable}
  on:movestart={DragStart}
  on:moveend={DragEnd}
  on:move={Drag}>
  <slot {active} {isDragging} {position} />
</g>
