<script>
  export let state;

  import { getContext } from 'svelte';
  import SnapRowCol from './SnapRowCol.svelte';
  import { GetGameObject } from '../game-object.ts';

  const schema = getContext('schema');
  const highlight = getContext('highlight');

  $: obj = GetGameObject($schema, $state, 'supply');
</script>

<div
  class:active={'supply' in $highlight}
  data-id="supply"
  data-droppable="true"
  class="absolute top-0 left-0 h-full w-64 bg-white shadow-lg transition duration-200"
>
  {#if obj}
    <SnapRowCol kind="column" id="supply" {obj} scale={0.135} center={true} />
  {/if}
</div>

<style>
  .active {
    @apply bg-gray-100;
  }
</style>
