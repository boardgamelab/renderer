<script>
  export let id;

  import Card from '../objects/card/Card.svelte';
  import { tweened } from 'svelte/motion';
  import { getContext } from 'svelte';

  const { schema, activeObjects, dispatchActions } = getContext('context');

  const offset = tweened({ x: 0, y: 0 }, { duration: 1 });
  let snapshot = null;

  const DragStart = ({ detail }) => {
    console.log(detail);
    snapshot = {
      x: detail.screen.x,
      y: detail.screen.y,
    };
  };

  const Drag = ({ detail }) => {
    activeObjects.set({
      [detail.id]: true,
    });

    offset.set({
      x: detail.screen.dx,
      y: detail.screen.dy,
    });
  };

  const DragEnd = ({ detail }) => {
    dispatchActions([
      {
        kind: 'position',
        id: detail.id,
        x: detail.svg.x,
        y: detail.svg.y,
      },
      {
        kind: 'add-to',
        id: detail.id,
        parent: null,
      },
    ]);
  };
</script>

<svg
  style="transform: translate3d({$offset.x}px, {$offset.y}px, 0)"
  data-id={id}
  data-draggable="true"
  on:movestart={DragStart}
  on:moveend={DragEnd}
  on:move={Drag}
  class="mx-2"
  width="100"
  viewBox="0 0 600 720"
  xmlns="http://www.w3.org/2000/svg">
  <Card {id} active={id in $activeObjects} />
</svg>
