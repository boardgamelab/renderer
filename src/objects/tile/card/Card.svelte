<script>
  export let id;
  export let obj;
  export let droppable = true;
  export let isDragging = false;
  export let active = false;
  export let forceFaceUp = false;
  export let forceFaceDown = false;
  export let forceRotation;
  export let selectable = true;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../../defaults.ts';
  import Back from './Back.svelte';

  const schema = getContext('schema');
  const renderer = getContext('renderer');
  const highlight = getContext('highlight');

  let width = 0;
  let height = 0;

  const template = obj.template;

  if (template) {
    const { geometry } = template.layout;
    width = geometry.width;
    height = geometry.height;
  }

  const fill = '#fff';
  const stroke = '#555';
  let faceDown = false;
  let rotation = tweened(0, { duration: 100 });

  function IsFaceEmpty(face) {
    if (!face) {
      return true;
    }

    if (!face.layers) {
      return true;
    }

    for (const layer of face.layers) {
      if (Object.keys(layer.parts).length) {
        return false;
      }
    }

    return true;
  }

  $: {
    const card = obj.stateVal;

    faceDown = false;
    if (card.faceDown) {
      faceDown = true;
    }
    if (card.rotation !== undefined) {
      rotation.set(card.rotation);
    } else {
      rotation.set(0);
    }

    if (forceRotation !== undefined) {
      rotation.set(forceRotation);
    }
  }
</script>

<g
  data-id={id}
  data-selectable={selectable}
  data-droppable={droppable}
  transform="rotate({$rotation}
  {width / 2}
  {height / 2})">

  <rect data-id={id} {width} {height} {fill} {stroke} stroke-width="5" />

  {#if forceFaceDown || (faceDown && !forceFaceUp)}
    {#if !template || IsFaceEmpty(template.layout.faces[1])}
      <Back {id} {width} {height} />
    {:else if renderer && id in $schema.objects}
      <svelte:component
        this={renderer}
        {width}
        {height}
        faceDown={true}
        templates={$schema.templates}
        object={$schema.objects[id]} />
    {/if}
  {:else if renderer && id in $schema.objects}
    <svelte:component
      this={renderer}
      {width}
      {height}
      templates={$schema.templates}
      object={$schema.objects[id]} />
  {/if}

  {#if id in $highlight || active}
    <rect
      in:fade|local={{ duration: 150 }}
      x={-10}
      y={-10}
      width={width + 20}
      height={height + 20}
      fill="none"
      stroke-width="10"
      stroke={selectionColor} />
  {/if}
</g>
