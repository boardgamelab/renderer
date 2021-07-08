<script>
  export let handID;

  import { getContext } from 'svelte';
  import { GetGameObject } from '../objects/game-object.ts';
  import SnapRowCol from '../objects/container/SnapRowCol.svelte';

  const schema = getContext('schema');
  const { dispatchActions, state } = getContext('context');
  const highlight = getContext('highlight');

  $: obj = GetGameObject($schema, $state, handID);
</script>

<div
  class="shadow-lg w-3/4 max-w-2xl mx-auto border border-t-8 border-gray-400
  shadow-lg rounded-t transition duration-200"
  class:active={handID in $highlight}
  data-id={handID}
  data-droppable="true"
>
  <div data-hand="true" class="hand">
    {#if obj.children.length === 0}
      <div class="text-gray-400 font-bold text-sm m-1 uppercase">Hand</div>
    {:else}
      <div class="mb-2 w-full">
        <SnapRowCol id={handID} kind="row" {obj} scale={0.15} />
      </div>
    {/if}
  </div>
</div>

<style>
  .hand {
    @apply relative select-none rounded-t h-10 py-1 font-bold flex flex-row items-end justify-center w-full bg-white;
  }

  .active {
    @apply shadow-xl;
  }
</style>
