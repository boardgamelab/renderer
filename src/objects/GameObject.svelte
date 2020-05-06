<script>
  import { drag } from '../gestures/drag.ts';
  import { getContext } from 'svelte';
  import { GetComponent } from './game-object.ts';
  import Card from './card/Card.svelte';
  import CardHolder from './card-holder/CardHolder.svelte';
  import { MergeOpts } from '../merge.ts';
  import { writable, derived } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { expoOut } from 'svelte/easing';

  export let id;

  const { state, schema, svg } = getContext('context');

  const component = GetComponent(schema, schema.objects[id]);
  const { templateID } = schema.objects[id];
  const template = schema.templates[templateID];

  const sizeOffset = tweened(
    { dx: 0, dy: 0 },
    {
      duration: 300,
      easing: expoOut,
    }
  );
  const rawPosition = writable({ x: 0, y: 0 });
  const positionOffset = tweened(
    { dx: 0, dy: 0 },
    {
      duration: 300,
      easing: expoOut,
    }
  );
  const position = derived(
    [rawPosition, positionOffset],
    ([$rawPosition, $positionOffset]) => {
      return {
        x: $rawPosition.x + $positionOffset.dx,
        y: $rawPosition.y + $positionOffset.dy,
      };
    }
  );

  $: {
    const opts = MergeOpts(schema, $state, id);
    const x = opts.x || 0;
    const y = opts.y || 0;
    rawPosition.set({ x, y });
  }

  let dragging = false;
  function DragStart() {
    dragging = true;
  }

  function DragEnd() {
    dragging = false;

    state.update(s => ({
      ...s,
      objects: {
        ...s.objects,
        [id]: {
          ...s.objects[id],
          opts: {
            ...s.objects[id].opts,
            x: $rawPosition.x,
            y: $rawPosition.y,
          },
        },
      },
    }));
  }

  function Drag({ detail }) {
    rawPosition.update(p => ({
      x: detail.snapshot.x + detail.dx,
      y: detail.snapshot.y + detail.dy,
    }));
  }

  const activeObject = getContext('activeObject');
  function Select(e) {
    activeObject.set(id);
  }
</script>

<g
  {id}
  use:drag={{ svg, snapshot: $rawPosition }}
  on:dragstart={DragStart}
  on:dragend={DragEnd}
  on:drag={Drag}
  on:touchstart={Select}
  on:mousedown={Select}>
  <svelte:component
    this={component}
    isDragging={dragging}
    objectID={id}
    {schema}
    {template}
    {sizeOffset}
    {position} />
</g>
