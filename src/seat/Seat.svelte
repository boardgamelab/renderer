<script>
  export let seatID;
  export let seat;
  export let player;
  export let color = '#aaa';

  import Icon from './Icon.svelte';
  import HandObject from '../hand/HandObject.svelte';
  import { GetGameObject } from '../objects/game-object.ts';
  import { getContext } from 'svelte';
  import { scale } from 'svelte/transition';

  const schema = getContext('schema');
  const state = getContext('state');
  const highlight = getContext('highlight');

  let children = [];
  let nickname = '';
  let passed = false;

  $: {
    passed = false;
    if ($state.ctx && $state.ctx.passed.indexOf(seatID) !== -1) {
      passed = true;
    }
  }

  $: {
    children = [];
    if (seat && seat.handID) {
      const handID = seat.handID;
      if (handID in $state.objects) {
        children = $state.objects[handID].children;
      }
    }

    nickname = '';
    if (player && player.nickname) {
      nickname = player.nickname;
    } else {
      color = '#ccc';
    }
  }
</script>

<style>
  .active {
    @apply bg-blue-200 shadow-xl;
  }

  .hand {
    @apply p-2 bg-white rounded-t flex flex-row items-center justify-center;
    padding-left: 50px;
    height: 2rem;
  }

  @screen md {
    .hand {
      height: 5rem;
    }
  }
</style>

<div
  class:active={seat.handID in $highlight}
  class="select-none relative transition duration-200 mx-2 border border-b-0
  rounded w-3/4 md:w-64 shadow-lg overflow-none"
  title={nickname}
  data-seat="true"
  data-droppable="true"
  data-id={seat.handID}>
  <div class="absolute top-0 right-0 m-2 text-xs text-gray-600 rounded-b">
    {nickname}
  </div>

  <div class="hand">
    {#each children as child, index (child)}
      <HandObject
        small={true}
        splay={true}
        id={child}
        handID={seat.handID}
        forceFaceDown={true}
        {index}
        obj={GetGameObject($schema, $state, child)} />
    {/each}
  </div>

  <div style="background: {color}" class="md:hidden rounded-b h-2 w-full" />
  <div class="hidden md:block bg-gray-400 h-2 w-full rounded-b" />

  {#if passed}
    <div
      in:scale|local={{ duration: 100 }}
      class="absolute top-0 left-0 text-xs bg-white md:m-1">
      <div class="border p-1 px-4 rounded bg-gray-100">passed</div>
    </div>
  {/if}

  <div
    class="invisible md:visible absolute pointer-events-none bottom-0 left-0
    w-full center">
    <div
      class="w-12 rounded-full border p-2 bg-white shadow transform
      translate-y-4">
      <Icon {color} />
    </div>
  </div>
</div>
