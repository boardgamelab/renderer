<script>
  export let id;
  export let isDragging = false;

  import { getContext } from 'svelte';

  const { schema } = getContext('context');
  const renderer = getContext('renderer');

  const { templateID } = schema.objects[id];
  const template = schema.templates[templateID];

  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  $: {
    width = template.geometry.width;
    height = template.geometry.height;
  }
</script>

{#if isDragging}
  <rect filter="url(#blur)" {width} {height} fill="#111" fill-opacity="5%" />
{/if}

<rect data-id={id} {width} {height} {fill} {stroke} />

{#if renderer}
  <svelte:component
    this={renderer}
    {width}
    {height}
    templates={schema.templates}
    object={schema.objects[id]} />
{/if}
