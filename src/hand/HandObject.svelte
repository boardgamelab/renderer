<script>
  export let id;

  import Card from '../objects/tile/card/Card.svelte';
  import { tweened } from 'svelte/motion';
  import { getContext } from 'svelte';
  import { ToClientLength, ToSVGLength } from '../utils/svg.ts';

  const { activeObjects, dispatchActions, svg } = getContext('context');
  const schema = getContext('schema');

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
    activeObjects.set({
      [detail.id]: true,
    });

    offset.set({
      x: detail.client.dx,
      y: detail.client.dy,
    });
  };

  const DragEnd = ({ detail }) => {
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
  };
</script>

<svg
  bind:this={ref}
  style="transform: translate3d({$offset.x}px, {$offset.y}px, 0) scale({$scale})"
  data-id={id}
  data-draggable="true"
  on:movestart={DragStart}
  on:moveend={DragEnd}
  on:move={Drag}
  class="mx-2 shadow-lg"
  width="100"
  viewBox="0 0 600 720"
  xmlns="http://www.w3.org/2000/svg">
  <Card {id} forceFaceUp={true} active={id in $activeObjects} />
</svg>
