<script>
  export let id;
  export let isDragging = false;
  export let active = false;
  export let forceFaceUp = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { selectionColor } from '../../defaults.ts';
  import Back from './Back.svelte';

  const { state } = getContext('context');
  const schema = getContext('schema');
  const renderer = getContext('renderer');
  const highlight = getContext('highlight');

  let geometry = { width: 0, height: 0 };

  let { width, height } = geometry;
  const fill = '#fff';
  const stroke = '#111';
  let faceDown = false;
  let rotation = tweened(0, { duration: 100 });

  $: {
    if (id in $schema.objects) {
      const { templateID } = $schema.objects[id];
      const template = $schema.templates[templateID];
      width = template.geometry.width;
      height = template.geometry.height;
    }

    if (id in $state.objects) {
      const card = $state.objects[id];
      faceDown = false;
      if (card.faceDown) {
        faceDown = true;
      }
      if (card.rotation !== undefined) {
        rotation.set(card.rotation);
      } else {
        rotation.set(0);
      }
    }
  }
</script>

<g
  data-id={id}
  data-droppable="true"
  transform="rotate({$rotation}
  {width / 2}
  {height / 2})">
  {#if isDragging}
    <rect
      filter="url(#blur)"
      x={10}
      y={10}
      {width}
      {height}
      fill="#111"
      fill-opacity="50%" />
  {/if}

  {#if faceDown && !forceFaceUp}
    <Back {id} {width} {height} />
  {:else}
    <rect data-id={id} {width} {height} {fill} {stroke} />

    {#if renderer && id in $schema.objects}
      <svelte:component
        this={renderer}
        {width}
        {height}
        templates={$schema.templates}
        object={$schema.objects[id]} />
    {/if}
  {/if}

  {#if id in $highlight || active}
    <rect
      x={-10}
      y={-10}
      width={width + 20}
      height={height + 20}
      fill="none"
      stroke-width="10"
      stroke={selectionColor} />
  {/if}
</g>
