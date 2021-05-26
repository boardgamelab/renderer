<script>
  import Moveable from './Moveable.svelte';
  import { Component } from '@boardgamelab/components';

  import Board from './container/Board.svelte';
  import Card from './tile/card/Card.svelte';
  import Deck from './container/Deck.svelte';

  export let id;
  export let obj;
  export let droppable;
  export let selectable;

  const components = {
    [Component.CARD]: Card,
    [Component.BOARD]: Board,
    [Component.DECK]: Deck,
  };
</script>

{#if obj.component}
  <Moveable {id} {obj} let:active let:isDragging>
    <svelte:component
      this={components[obj.component.type]}
      {obj}
      {id}
      {active}
      {droppable}
      {selectable}
      {isDragging} />
  </Moveable>
{/if}
