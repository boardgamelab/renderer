<script>
  import { getContext } from 'svelte';
  import { GetComponent } from './game-object.ts';
  import Card from './card/Card.svelte';
  import CardHolder from './card-holder/CardHolder.svelte';
  import { MergeOpts } from '../merge.ts';

  export let id;

  const { state, schema } = getContext('context');

  const component = GetComponent(schema, schema.objects[id]);
  const { templateID } = schema.objects[id];
  const template = schema.templates[templateID];

  let x;
  let y;
  $: {
    const opts = MergeOpts(schema, $state, id);
    x = opts.x || 0;
    y = opts.y || 0;
  }

  const { drag, mouseup, activeObjectID } = getContext('mouse');

  let dragStart = null;
  function MouseDown(e) {
    dragStart = { x, y };
    activeObjectID.set(id);
  }

  drag.subscribe(e => {
    if (dragStart === null) return;
    x = dragStart.x + e.delta.x;
    y = dragStart.y + e.delta.y;
  });

  mouseup.subscribe(() => {
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
              x,
              y,
            },
          },
        },
      }));
    }
    activeObjectID.set(null);
  });
</script>

<g {id} on:mousedown={MouseDown}>
  <title>{id}</title>
  <svelte:component
    this={component}
    objectID={id}
    {schema}
    {template}
    {x}
    {y} />
</g>
