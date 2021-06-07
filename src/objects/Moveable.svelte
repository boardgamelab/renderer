<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { Drop } from './moveable.ts';
  import { send, receive } from '../utils/crossfade.ts';
  import { ghost } from '../ghost/ghost.ts';
  import { tweened } from 'svelte/motion';

  export let id;
  export let obj;
  export let parentID = null;
  export let draggable = true;

  const dispatch = createEventDispatcher();
  const { dispatchActions, state, activeObjects } = getContext('context');

  const highlight = getContext('highlight');
  const toSVGPoint = getContext('to-svg-point');
  const viewOnly = getContext('viewOnly');

  $: active = id in $activeObjects;

  let x = obj.stateVal.x || 0;
  let y = obj.stateVal.y || 0;

  const position = tweened({ x, y }, { duration: 0 });

  $: {
    if (x !== obj.stateVal.x || y !== obj.stateVal.y) {
      x = obj.stateVal.x || 0;
      y = obj.stateVal.y || 0;
      position.set({ x, y }, { duration: 150 });
    }
  }

  let hide = false;
  let dragged = false;

  function DragStart() {
    dispatch("movestart");
    dragged = false;
    hide = true;
  }

  // TODO: Make ghost emit synthetic events so that it can
  // delay DragEnd in case it needs to reanimate itself back
  // to another position.
  async function DragEnd({ detail }) {
    dispatch("moveend");

    highlight.set({});

    // If the object switches containers, we don't
    // have to restore visibility because the object will be created
    // anew at the new destination. If we did restore visibility in
    // those cases, there will be a slight flickering artifact as the
    // object becomes visible right before it disappears again as it
    // is destroyed.
    if (detail.dropID === parentID) {
      hide = false;
    }

    if (!dragged) {
      return;
    }

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
    }

    const absolutePosition = { x: detail.svg.targetX, y: detail.svg.targetY };
    Drop(id, drop, absolutePosition, dispatchActions, position);
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
  };
</script>

<style>
  .hide {
    @apply opacity-0 pointer-events-none;
  }
</style>

<!-- The object has to continue existing while the ghost is
     active so that the ghost is not destroyed. Instead, we hide
     it using CSS -->
<g
  use:ghost={{ id, disable: $viewOnly, onTable: true, parentID }}
  transform="translate({$position.x || 0}, {$position.y || 0})"
  class:hide
  out:send={{ key: id, toSVGPoint, parentID }}
  in:receive={{ key: id, toSVGPoint, parentID }}
  data-id={id}
  data-component={obj.stateVal.componentID}
  data-draggable={draggable}
  on:movestart={!$viewOnly && DragStart}
  on:moveend={!$viewOnly && DragEnd}
  on:move={!$viewOnly && Drag}>
  <slot {active} {hide} />
</g>
