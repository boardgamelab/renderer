<script>
  // The ID of the hand container.
  export let handID;
  // The index of this object in the hand container.
  export let index;
  // The ID of the object.
  export let id;
  // The state value of the object.
  export let obj;

  import Card from '../objects/tile/card/Card.svelte';
  import { ghost } from '../ghost/ghost.ts';
  import { send, receive } from '../utils/crossfade.ts';
  import { createEventDispatcher, getContext } from 'svelte';
  import { ToSVGLength } from '../utils/svg.ts';

  const { activeObjects, dispatchActions, svg } = getContext('context');
  const schema = getContext('schema');
  const toSVGPoint = getContext('to-svg-point');
  const highlight = getContext('highlight');
  const ghostAPI = getContext('ghost');
  const dispatch = createEventDispatcher();

  // Add a margin around the SVG container so that things
  // like borders can be seen.
  const margin = 20;

  let ref;
  let isDragging = false;
  let cursorOffset = null;

  let geometry = { width: 0 };

  if (id in $schema.objects) {
    const { templateID } = $schema.objects[id];
    geometry = $schema.templates[templateID].geometry;
  }

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

    if (detail.dropID !== handID) {
      if (detail.dropID) {
        activeObjects.set({
          [detail.dropID]: true,
        });

        dispatchActions([
          {
            type: 'add-to',
            subject: { id: detail.id },
            dest: { id: detail.dropID },
          },
        ]);
      } else if (cursorOffset) {
        dispatchActions([
          {
            type: 'position',
            subject: { id: detail.id },
            x: detail.svg.x + ToSVGLength(cursorOffset.dx, svg.el),
            y: detail.svg.y + ToSVGLength(cursorOffset.dy, svg.el),
          },
          {
            type: 'add-to',
            subject: { id: detail.id },
            dest: null,
          },
        ]);
      }
    } else {
      isDragging = false;
    }
  };
</script>

<div class="mx-2" class:opacity-0={isDragging}>
  <svg
    use:ghost={{ api: $ghostAPI, parentID: handID }}
    out:send={{ key: id, toSVGPoint, hand: true, nuke: isDragging }}
    in:receive={{ key: id, toSVGPoint, hand: true }}
    data-id={id}
    data-selectable="true"
    data-draggable="true"
    on:movestart={DragStart}
    on:moveend={DragEnd}
    on:move={Drag}
    width="100"
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
        forceFaceUp={true}
        active={id in $activeObjects} />
    </g>
  </svg>
</div>
