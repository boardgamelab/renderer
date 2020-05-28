<script>
  export let id;
  export let isDragging = false;
  export let active = false;

  import { getContext } from 'svelte';
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
  let faceUp = true;

  $: {
    if (id in $schema.objects) {
      const { templateID } = $schema.objects[id];
      const template = $schema.templates[templateID];
      width = template.geometry.width;
      height = template.geometry.height;
    }

    if (id in $state.objects) {
      faceUp = true;
      if ($state.objects[id].faceUp === false) {
        faceUp = false;
      }
    }
  }
</script>

<g>
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

  {#if faceUp}
    <rect data-id={id} {width} {height} {fill} {stroke} />

    {#if renderer && id in $schema.objects}
      <svelte:component
        this={renderer}
        {width}
        {height}
        templates={$schema.templates}
        object={$schema.objects[id]} />
    {/if}
  {:else}
    <Back {id} {width} {height} />
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
