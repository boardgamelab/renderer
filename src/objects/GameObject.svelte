<script>
  import { getContext } from 'svelte';
  import { GetComponent } from './game-object.ts';
  import Moveable from './Moveable.svelte';
  import { Component } from '@boardgamelab/components';

  export let id;

  const { state } = getContext('context');
  const schema = getContext('schema');

  let component = null;
  $: component = GetComponent($schema, $state, id);
</script>

<Moveable {id} let:active let:isDragging let:position>
  <svelte:component this={component} {id} {active} {isDragging} {position} />
</Moveable>
