<script>
  export let id;
  export let isDragging = false;
  export let active = false;

  import { getContext } from 'svelte';
  import { selectionColor } from '../../defaults.ts';

  const schema = getContext('schema');
  const renderer = getContext('renderer');
  const highlight = getContext('highlight');

  if (!(id in $schema.objects)) {
    console.log(`${id} not found in schema.objects`);
  }

  const { templateID } = $schema.objects[id];
  const template = $schema.templates[templateID];

  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  $: {
    width = template.geometry.width;
    height = template.geometry.height;
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

  <rect data-id={id} {width} {height} {fill} {stroke} />

  {#if renderer}
    <svelte:component
      this={renderer}
      {width}
      {height}
      templates={$schema.templates}
      object={$schema.objects[id]} />
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
