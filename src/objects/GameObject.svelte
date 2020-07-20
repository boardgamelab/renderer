<script>
  import Moveable from './Moveable.svelte';
  import { Component } from '@boardgamelab/components';

  import Anchor from './container/Anchor.svelte';
  import Card from './tile/card/Card.svelte';
  import Deck from './container/Deck.svelte';

  export let id;
  export let obj;

  let components = {
    [Component.CARD]: Card,
    [Component.ANCHOR]: Anchor,
    [Component.DECK]: Deck,
  };
</script>

{#if obj.template}
  <Moveable {id} {obj} let:active let:isDragging let:position>
    <svelte:component
      this={components[obj.template.type]}
      {obj}
      {id}
      {active}
      {isDragging}
      {position} />
  </Moveable>
{/if}
