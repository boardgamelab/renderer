<script>
  export let id;
  export let obj;
  export let anchor;
  export let droppable = true;
  export let active = false;
  export let forceFaceUp = false;
  export let forceFaceDown = false;
  export let forceRotation = null;
  export let selectable = true;
  export let isDragging = false;

  import { getContext } from 'svelte';
  import { backOut } from "svelte/easing";
  import { tweened } from 'svelte/motion';

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

  let faceDown = false;
  let rotation = tweened(0, { duration: 400, easing: backOut });

  $: translate = anchor ?
  `translate(${Math.round(anchor.x - width / 2)}, ${Math.round(anchor.y - height / 2)})`
    : "";

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

    if (forceRotation !== null) {
      rotation.set(forceRotation);
    }
  }
</script>

<g
  data-id={id}
  data-preview="true"
  data-selectable={selectable}
  data-component={component.id}
  data-droppable={droppable}
  transform="rotate({$rotation}
  {width / 2}
  {height / 2}) {translate}">

  {#if renderer && obj.instance}
    <svelte:component
      this={renderer}
      {width}
      {height}
      faceDown={forceFaceDown || (faceDown && !forceFaceUp)}
      {component}
      highlight={id in $highlight || active}
      instance={obj.instance} />
  {/if}
</g>
