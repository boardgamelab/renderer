<script>
  import { getContext, onDestroy } from 'svelte';
  import { GetComponent } from './game-object.ts';
  import Card from './card/Card.svelte';
  import CardHolder from './card-holder/CardHolder.svelte';
  import { MergeOpts } from '../merge.ts';
  import { writable, derived } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { expoOut } from 'svelte/easing';

  export let id;

  const { state, schema } = getContext('context');

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

  const { drag, mouseup, activeObjectID } = getContext('mouse');

  let dragStart = null;
  function ActivateDrag(e) {
    dragStart = { x: $rawPosition.x, y: $rawPosition.y };
    activeObjectID.set(id);
  }

  const dragUnsub = drag.subscribe(e => {
    if (dragStart === null) return;
    const x = dragStart.x + e.delta.x;
    const y = dragStart.y + e.delta.y;
    rawPosition.set({ x, y });
  });

  const mouseUnsub = mouseup.subscribe(() => {
    if (dragStart) {
      dragStart = null;

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
    activeObjectID.set(null);
  });

  onDestroy(() => {
    dragUnsub();
    mouseUnsub();
  });
</script>

<g {id} on:touchstart={ActivateDrag} on:mousedown={ActivateDrag}>
  <svelte:component
    this={component}
    objectID={id}
    {schema}
    {template}
    {sizeOffset}
    {position}
    isDragging={dragStart !== null} />
</g>
