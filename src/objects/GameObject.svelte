<script>
  import Moveable from './Moveable.svelte';
  import { Component } from '@boardgamelab/components';

  import Stack from './container/Stack.svelte';
  import Tile from './tile/Tile.svelte';

  export let id;
  export let obj;
  export let anchor = null;
  export let forceFaceDown = false;
  export let droppable = true;
  export let selectable = true;
  export let parentID = null;

  const components = {
    [Component.TILE]: Tile,
    [Component.CARD]: Tile,
  };

  let component = null;
  $: {
    component = null;

    if (obj.stateVal.kind === 'stack') {
      component = Stack;
    } else if (obj.component) {
      component = components[obj.component.type];
    }
  }
</script>

{#if component}
  <Moveable
    on:movestart
    on:moveend
    {id}
    {obj}
    {parentID}
    let:active
    let:isDragging
  >
    <svelte:component
      this={component}
      {anchor}
      {obj}
      {id}
      {active}
      {droppable}
      {selectable}
      {forceFaceDown}
      {isDragging}
    />
  </Moveable>
{/if}
