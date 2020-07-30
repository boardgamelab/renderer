<script>
  export let state;
  export let seat;
  export let color;

  import HandObject from '../../hand/HandObject.svelte';
  import { GetGameObject } from '../../objects/game-object.ts';
  import { getContext } from 'svelte';

  const schema = getContext('schema');
  const highlight = getContext('highlight');

  let children = [];
  let nickname = '';

  $: {
    children = [];
    const { seatID } = seat;
    if ($state && $state.seats && seatID in $state.seats) {
      const { handID } = $state.seats[seatID];
      if (handID in $state.objects) {
        children = $state.objects[handID].children;
      }
    }

    nickname = '';
    if (seat.player && seat.player.nickname) {
      nickname = seat.player.nickname;
    }
  }
</script>

<style>
  .active {
    @apply h-8;
  }
</style>

<div
  class="select-none mx-2 border border-t-0 rounded-bl-lg rounded-br-lg w-3/4
  md:w-64 shadow-lg overflow-none"
  title={nickname}
  data-droppable="true"
  data-id={seat.seatID}>
  <div
    style="padding-left: 50px"
    class="p-2 bg-white flex flex-row items-center justify-center">
    {#each children as child, index (child)}
      <HandObject
        small={true}
        id={child}
        handID={seat.seatID}
        forceFaceDown={true}
        {index}
        obj={GetGameObject($schema, $state, child)} />
    {/each}
  </div>

  <div
    class:active={seat.seatID in $highlight}
    class="transform duration-200 h-6 center text-xs text-white rounded-bl-lg
    rounded-br-lg"
    style="background-color: {color}">
    {nickname}
  </div>
</div>
