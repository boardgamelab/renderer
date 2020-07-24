<script>
  import { getContext } from 'svelte';
  import { Drop } from './moveable.ts';
  import { tweened } from 'svelte/motion';
  import { send, receive } from '../utils/crossfade.ts';

  export let id;
  export let obj;
  export let parentID = null;
  export let parentPos = null;
  export let draggable = true;

  const { dispatchActions, state, activeObjects } = getContext('context');

  const highlight = getContext('highlight');
  const toSVGPoint = getContext('to-svg-point');
  const position = tweened(null, { duration: 0 });

  let x;
  let y;
  let prevParent = null;

  $: {
    const newX = obj.stateVal.x || 0;
    const newY = obj.stateVal.y || 0;

    let changed = false;
    if (newX !== x || newY !== y) {
      changed = true;
    }

    x = newX;
    y = newY;

    const currParent = obj.stateVal.parent || null;

    if (changed) {
      if ($state.remote && !currParent && !prevParent) {
        position.set({ x, y }, { duration: 150 });
      } else {
        position.set({ x, y });
      }
    }

    prevParent = currParent;
  }

  let isDragging = false;
  let dragged = false;
  let snapshot = null;
  function DragStart() {
    dragged = false;

    snapshot = $position;

    let toRaise = id;
    if (obj.stateVal.parent) {
      toRaise = obj.stateVal.parent;
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

  async function DragEnd({ detail }) {
    isDragging = false;

    highlight.set({});

    if (!dragged) {
      return;
    }

    const absolutePosition = RelativeToSVG($position);

    let drop = null;

    if (detail.dropID) {
      drop = {
        targetID: detail.dropID,
      };

      // If we're dropping the object back on its existing parent,
      // undo any position changes.
      if (detail.dropID === parentID) {
        position.set(
          {
            x: obj.stateVal.x || 0,
            y: obj.stateVal.y || 0,
          },
          { duration: 150 }
        );
        return;
      }
    }

    Drop(id, drop, absolutePosition, dispatchActions);
  }

  const Drag = ({ detail }) => {
    let h = {};
    if (detail.dropID && detail.dropID !== parentID) {
      h = {
        [detail.dropID]: true,
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

  let active = false;
  $: active = id in $activeObjects;
</script>

<g
  transform="translate({$position.x}, {$position.y})"
  out:send={{ key: id, toSVGPoint }}
  in:receive={{ key: id, toSVGPoint }}
  data-id={id}
  data-draggable={draggable}
  on:movestart={DragStart}
  on:moveend={DragEnd}
  on:move={Drag}>
  <slot {active} {isDragging} {position} />
</g>
