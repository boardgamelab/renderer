<script>
  export let state;

  import { getContext } from 'svelte';
  import SnapRowCol from './SnapRowCol.svelte';
  import { GetGameObject } from '../game-object.ts';
  import { fly } from 'svelte/transition';

  const schema = getContext('schema');
  const highlight = getContext('highlight');
  const isMobile = getContext('isMobile');

  let show = true;

  $: obj = GetGameObject($schema, $state, 'supply');
  $: scale = $isMobile ? 0.07 : 0.135;

  function Toggle() {
    show = !show;
  }
</script>

{#if show && obj && obj.children.length}
  <div
    class:active={'supply' in $highlight}
    transition:fly|local={{ x: -100, duration: 200 }}
    data-id="supply"
    data-droppable="true"
    class="supply"
  >
    <div class="text-sm uppercase font-bold text-center text-gray-400 p-4">
      Supply
    </div>

    {#if obj}
      <SnapRowCol kind="column" id="supply" {obj} {scale} center={true} />
    {/if}
  </div>
{/if}

<style>
  .supply {
    @apply absolute top-0 left-0 h-full w-64 bg-white shadow-lg border-r transition duration-200;
    max-width: 25%;
  }

  .active {
    @apply bg-gray-100;
  }
</style>
