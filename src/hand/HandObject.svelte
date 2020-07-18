<script>
  export let id;

  import Card from '../objects/tile/card/Card.svelte';
  import { send, receive } from '../utils/crossfade.js';
  import { tweened } from 'svelte/motion';
  import { getContext } from 'svelte';
  import { ToClientLength, ToSVGLength } from '../utils/svg.ts';

  const { state, activeObjects, dispatchActions, svg } = getContext('context');
  const schema = getContext('schema');
  const toSVGPoint = getContext('to-svg-point');
  const toClientPoint = getContext('to-client-point');
  const highlight = getContext('highlight');

  const offset = tweened({ x: 0, y: 0 }, { duration: 0 });
  const scale = tweened(1, { duration: 100 });
  let ref;
  let snapshot = null;
  let cursorOffset = null;

  let geometry = { width: 0 };

  if (id in $schema.objects) {
    const { templateID } = $schema.objects[id];
    geometry = $schema.templates[templateID].geometry;
  }

  const DragStart = ({ detail }) => {
    const rect = ref.getBoundingClientRect();

    snapshot = {
      x: detail.client.x,
      y: detail.client.y,
    };

    // Scale the object so that it appears the same
    // size as equivalent objects in the SVG viewport.
    const targetWidth = ToClientLength(geometry.width, svg.el);
    const currentWidth = rect.width;
    const s = targetWidth / currentWidth;
    scale.set(s);

    // Calculate the distance between the cursor and the
    // top-left of the object. It's important to take into
    // consideration any scaling that may be applied to the
    // object here.
    const scaledX = rect.x - (rect.width * (s - 1)) / 2;
    const scaledY = rect.y - (rect.height * (s - 1)) / 2;
    cursorOffset = {
      dx: snapshot.x - scaledX,
      dy: snapshot.y - scaledY,
    };
  };

  const Drag = ({ detail }) => {
    let h = {};
    if (detail.dropID) {
      h = {
        [detail.dropID]: true,
      };
    }
    highlight.set(h);

    activeObjects.set({
      [detail.id]: true,
    });

    offset.set({
      x: detail.client.dx,
      y: detail.client.dy,
    });
  };

  const DragEnd = async ({ detail }) => {
    if (detail.dropID) {
      // Animate to drop point.
      const dropObject = $state.objects[detail.dropID] || {};

      if (dropObject.x || dropObject.y) {
        let dropPosition = {
          x: dropObject.x || 0,
          y: dropObject.y || 0,
        };

        dropPosition = toClientPoint(dropPosition, svg.el);

        // Calculate offset of drop point relative to the
        // current position of the object.
        const rect = ref.getBoundingClientRect();
        const dropOffset = {
          x: dropPosition.x - rect.left,
          y: dropPosition.y - rect.top,
        };

        await offset.update(
          (o) => ({
            x: o.x + dropOffset.x,
            y: o.y + dropOffset.y,
          }),
          { duration: 150 }
        );
      }

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
    } else {
      dispatchActions([
        {
          type: 'position',
          subject: { id: detail.id },
          x: detail.svg.x - ToSVGLength(cursorOffset.dx, svg.el),
          y: detail.svg.y - ToSVGLength(cursorOffset.dy, svg.el),
        },
        {
          type: 'add-to',
          subject: { id: detail.id },
          dest: null,
        },
      ]);
    }
  };
</script>

<svg
  bind:this={ref}
  style="transform: translate3d({$offset.x}px, {$offset.y}px, 0) scale({$scale})"
  out:send={{ key: id, toSVGPoint, animate: $state.remote, hand: true }}
  in:receive={{ key: id, toSVGPoint, animate: $state.remote, hand: true }}
  data-id={id}
  data-draggable="true"
  on:movestart={DragStart}
  on:moveend={DragEnd}
  on:move={Drag}
  class="mx-2 shadow-lg"
  width="100"
  viewBox="0 0 {geometry.width}
  {geometry.height}"
  xmlns="http://www.w3.org/2000/svg">
  <Card
    {id}
    forceRotation={0}
    forceFaceUp={true}
    active={id in $activeObjects} />
</svg>
