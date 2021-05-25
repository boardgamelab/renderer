<script>
  import { getContext } from 'svelte';
  import { Drop } from './moveable.ts';
  import { tweened } from 'svelte/motion';
  import { send, receive } from '../utils/crossfade.ts';
  import { ghost } from '../ghost/ghost.ts';

  export let id;
  export let obj;
  export let parentID = null;
  export let parentPos = null;
  export let draggable = true;

  const { dispatchActions, state, activeObjects } = getContext('context');

  const highlight = getContext('highlight');
  const toSVGPoint = getContext('to-svg-point');
  const ghostAPI = getContext('ghost');
  const viewOnly = getContext('viewOnly');

  const position = tweened(null, { duration: 0 });

  let x;
  let y;

  $: {
    x = obj.stateVal.x || 0;
    y = obj.stateVal.y || 0;
    position.set({ x, y }, { duration: 150 });
  }

  let isDragging = false;
  let dragged = false;
  let snapshot = null;
  function DragStart() {
    dragged = false;
    isDragging = true;

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
        type: 'object',
        raise: null,
        context: {
          subject: {
            id: toRaise,
          },
        },
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
    highlight.set({});

    // if (detail.dropID === parentID) {
    isDragging = false;
    // }

    if (!dragged) {
      return;
    }

    const absolutePosition = RelativeToSVG($position);

    let drop = null;

    if (detail.dropID) {
      drop = {
        targetID: detail.dropID,
      };

      const target = $state.objects[detail.dropID];
      if (target) {
        if (target.t === 'tile') {
          activeObjects.set({
            ['deck-' + detail.dropID]: true,
          });
        }
        if (target.t === 'container') {
          activeObjects.set({
            [detail.dropID]: true,
          });
        }
      }

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

    activeObjects.set({
      [id]: true,
    });

    position.set({
      x: snapshot.x + detail.svg.dx,
      y: snapshot.y + detail.svg.dy,
    });
  };

  $: active = id in $activeObjects;
</script>

<style>
  .hide {
    @apply opacity-0 pointer-events-none;
  }
</style>

<g
  data-preview="true"
  use:ghost={{ api: $ghostAPI, disable: $viewOnly, onTable: true, parentID }}
  transform="translate({$position.x}, {$position.y})"
  class:hide={isDragging}
  out:send={{ key: id, toSVGPoint, disable: isDragging }}
  in:receive={{ key: id, toSVGPoint }}
  data-id={id}
  data-component={obj.component.id}
  data-draggable={draggable}
  on:movestart={!$viewOnly && DragStart}
  on:moveend={!$viewOnly && DragEnd}
  on:move={!$viewOnly && Drag}>
  <slot {active} {isDragging} {position} />
</g>
