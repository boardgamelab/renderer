<script>
  import { getContext } from 'svelte';
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
  function MouseDown(e) {
    // Ignore right-clicks.
    if (e.button !== 0) {
      return;
    }
    dragStart = { x: $rawPosition.x, y: $rawPosition.y };
    positionOffset.set({ dx: -50, dy: -50 });
    activeObjectID.set(id);
  }

  drag.subscribe(e => {
    if (dragStart === null) return;
    const x = dragStart.x + e.delta.x;
    const y = dragStart.y + e.delta.y;
    rawPosition.set({ x, y });
  });

  mouseup.subscribe(() => {
    if (dragStart) {
      dragStart = null;
      positionOffset.set({ dx: 0, dy: 0 });

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
</script>

<g {id} on:mousedown={MouseDown}>
  <svelte:component
    this={component}
    objectID={id}
    {schema}
    {template}
    {sizeOffset}
    {position}
    isDragging={dragStart !== null} />
</g>
