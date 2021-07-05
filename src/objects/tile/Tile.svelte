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
  export const isDragging = false;

  import { getContext } from 'svelte';
  import { backOut } from "svelte/easing";
  import { tweened } from 'svelte/motion';
  import Snap from "../container/Snap.svelte";
  import Size from "../container/Size.svelte";
  import GameObject from "../GameObject.svelte";

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

  async function ShuffleAnimation() {
    await rotation.update((r) => r + 359);
    await rotation.set(0, { duration: 1 });
  }

  let shuffleID = null;
  $: {
    const newID = obj.stateVal.shuffleID;
    if (newID && newID !== shuffleID) {
      ShuffleAnimation();
      shuffleID = newID;
    }
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

  $: types = obj.stateVal.types.map(t => {
    if (t.component) return t.component;
    if (t.trait) return t.trait;
    return t;
  }).join(' ');
</script>

<g
  data-id={id}
  data-preview="true"
  data-selectable={selectable}
  data-component={component.id}
  data-droppable={droppable}
  data-types={types}
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

  {#if obj.snapZones.length}
    {#each obj.snapZones as zone (zone.id)}
      <g transform="translate({zone.stateVal.x} {zone.stateVal.y})">
        <Snap id={zone.id} obj={zone} />
      </g>
    {/each}
  {/if}

  {#if obj.children.length}
    {#each obj.children.slice(-10) as child (child.id)}
      <GameObject
        id={child.id}
        obj={child}
        parentID={id}
        selectable={true}
        droppable={false} />
    {/each}

    <Size stack={true} {obj} {width} {height} highlight={id in $highlight || active} />
  {/if}
</g>
