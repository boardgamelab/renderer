<script>
  import Moveable from './Moveable.svelte';
  import { Component } from '@boardgamelab/components';

  import Board from './container/Board.svelte';
  import Card from './tile/card/Card.svelte';
  import Deck from './container/Deck.svelte';

  export let id;
  export let obj;
  export let anchor;
  export let droppable;
  export let selectable;
  export let parentID;

  const components = {
    [Component.CARD]: Card,
    [Component.BOARD]: Board,
  };

  let component = null;
  $: {
    component = null;
    if (obj.component) {
      component = components[obj.component.type];
    } else if (obj.stateVal.kind === "deck") {
      component = Deck;
    }
  }
</script>

{#if component}
  <Moveable on:movestart on:moveend {id} {obj} {parentID} let:active let:isDragging>
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
