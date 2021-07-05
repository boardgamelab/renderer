<script>
  import Moveable from './Moveable.svelte';
  import { Component } from '@boardgamelab/components';

  import Board from './container/Board.svelte';
  import Tile from './tile/Tile.svelte';

  export let id;
  export let obj;
  export let anchor = null;
  export let droppable = true;
  export let selectable = true;
  export let parentID = null;

  const components = {
    [Component.TILE]: Tile,
    [Component.CARD]: Tile,
    [Component.BOARD]: Board,
  };

  let component = null;
  let draggable = true;
  $: {
    component = null;
    if (obj.component) {
      component = components[obj.component.type];
    }

    if (component === Board) {
      draggable = false;
    }
  }
</script>

{#if component}
  <Moveable on:movestart on:moveend {id} {draggable} {obj} {parentID} let:active let:isDragging>
    <svelte:component
      this={component}
      {anchor}
      {obj}
      {id}
      {active}
      {droppable}
      {selectable}
      {isDragging} />
  </Moveable>
{/if}
