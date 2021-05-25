<script>
  // The ID of the hand container.
  export let handID;
  // The index of this object in the hand container.
  export let index;
  // The ID of the object.
  export let id;
  // The state value of the object.
  export let obj;

  export let small = false;

  export let splay = false;

  export let forceFaceUp = true;

  export let forceFaceDown = false;

  import Card from '../objects/tile/card/Card.svelte';
  import { ghost } from '../ghost/ghost.ts';
  import { send, receive } from '../utils/crossfade.ts';
  import { createEventDispatcher, getContext } from 'svelte';
  import { ToSVGLength } from '../utils/svg.ts';

  const { activeObjects, dispatchActions, svg } = getContext('context');
  const toSVGPoint = getContext('to-svg-point');
  const highlight = getContext('highlight');
  const ghostAPI = getContext('ghost');
  const viewOnly = getContext('viewOnly');
  const isMobile = getContext('isMobile');
  const dispatch = createEventDispatcher();

  // Add a margin around the SVG container so that things
  // like borders can be seen.
  const margin = 20;

  $: mobileMultiplier = $isMobile ? 0.5 : 1;

  let ref;
  let isDragging = false;
  let cursorOffset = null;

  let geometry = obj.component.layout.geometry;

  function DragStart({ detail }) {
    isDragging = true;

    const rect = ref.getBoundingClientRect();

    cursorOffset = {
      dx: rect.x - detail.client.x,
      dy: rect.y - detail.client.y,
    };

    dispatch('movestart', {
      ...detail,
      index,
      id,
      ref: this,
    });
  }

  const Drag = ({ detail }) => {
    dispatch('move', detail);

    let h = {};
    if (detail.dropID && detail.dropID !== handID) {
      h = {
        [detail.dropID]: true,
      };
    }
    highlight.set(h);

    activeObjects.set({
      [detail.id]: true,
    });
  };

  const DragEnd = ({ detail }) => {
    dispatch('moveend', { index });

    highlight.set({});

    if (!$viewOnly && detail.dropID !== handID) {
      if (detail.dropID) {
        activeObjects.set({
          [detail.dropID]: true,
        });

        dispatchActions([
          {
            type: 'object',
            context: { subject: { id: detail.id }, args: [{ object: detail.dropID }] },
            move: {},
          },
        ]);
      } else if (cursorOffset) {
        dispatchActions([
          {
            type: 'object',
            context: { subject: { id: detail.id } },
            position: {
              x: detail.svg.x + ToSVGLength(cursorOffset.dx, svg.el),
              y: detail.svg.y + ToSVGLength(cursorOffset.dy, svg.el),
            },
          },
          {
            type: 'object',
            context: { subject: { id: detail.id } },
            move: {},
          },
        ]);
      }
    } else {
      isDragging = false;
    }
  };
</script>

<style>
  .hide {
    @apply opacity-0 pointer-events-none;
  }

  .splay {
    margin-left: -20px;
  }

  @screen md {
    .splay {
      margin-left: -40px;
    }
  }
</style>

<div class:splay class:small class:hide={isDragging}>
  <svg
    class="hand-object"
    use:ghost={{ api: $ghostAPI, parentID: handID }}
    out:send|local={{ key: id, toSVGPoint, hand: true, disable: isDragging }}
    in:receive|local={{ key: id, toSVGPoint, hand: true }}
    data-id={id}
    data-preview="true"
    data-selectable="true"
    data-draggable="true"
    on:movestart={DragStart}
    on:moveend={DragEnd}
    on:move={Drag}
    width={(small ? 50 : 100) * mobileMultiplier}
    viewBox="-{margin} -{margin}
    {geometry.width + 2 * margin}
    {geometry.height + 2 * margin}"
    xmlns="http://www.w3.org/2000/svg">
    <g bind:this={ref}>
      <Card
        {id}
        {obj}
        droppable={false}
        forceRotation={0}
        {forceFaceUp}
        {forceFaceDown}
        active={id in $activeObjects} />
    </g>
  </svg>
</div>
