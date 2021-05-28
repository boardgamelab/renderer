<script>
  export let id;
  export let obj;
  export let anchor;
  export let droppable = true;
  export let active = false;
  export let forceFaceUp = false;
  export let forceFaceDown = false;
  export let forceRotation;
  export let selectable = true;

  import { getContext } from 'svelte';
  import { backOut } from "svelte/easing";
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../../defaults.ts';
  import Back from './Back.svelte';

  const renderer = getContext('renderer');
  const highlight = getContext('highlight');

  let width = 0;
  let height = 0;

  const component = obj.component;

  if (component) {
    const { geometry } = component.layout;
    width = geometry.width;
    height = geometry.height;
  }

  const fill = '#fff';
  const stroke = '#555';
  let faceDown = false;
  let rotation = tweened(0, { duration: 400, easing: backOut });

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

  let translate = "";
  if (anchor) {
    translate = `translate(${anchor.x - width / 2}, ${anchor.y - height / 2})`;
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
  data-component={component.id}
  data-droppable={droppable}
  transform="rotate({$rotation}
  {width / 2}
  {height / 2}) {translate}">

  <rect data-id={id} {width} {height} {fill} {stroke} stroke-width="5" />

  {#if forceFaceDown || (faceDown && !forceFaceUp)}
    {#if !component || IsFaceEmpty(component.layout.faces[1])}
      <Back {id} {width} {height} />
    {:else if renderer && obj.instance}
      <svelte:component
        this={renderer}
        {width}
        {height}
        faceDown={true}
        {component}
        instance={obj.instance} />
    {/if}
  {:else if renderer && obj.instance}
    <svelte:component
      this={renderer}
      {width}
      {height}
      {component}
      instance={obj.instance} />
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
