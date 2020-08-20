<script>
  export let seat;
  export let player;
  export let color = '#aaa';

  import HandObject from '../../hand/HandObject.svelte';
  import { GetGameObject } from '../../objects/game-object.ts';
  import { getContext } from 'svelte';

  const schema = getContext('schema');
  const state = getContext('state');
  const highlight = getContext('highlight');

  let children = [];
  let nickname = '';

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
      color = '#aaa';
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
  data-seat="true"
  data-droppable="true"
  data-id={seat.handID}>
  <div
    style="padding-left: 50px"
    class="p-2 bg-white flex flex-row items-center justify-center">
    {#each children as child, index (child)}
      <HandObject
        small={true}
        id={child}
        handID={seat.handID}
        forceFaceDown={true}
        {index}
        obj={GetGameObject($schema, $state, child)} />
    {/each}
  </div>

  <div
    class:active={seat.handID in $highlight}
    class="transform duration-200 h-6 center text-xs text-white rounded-bl-lg
    rounded-br-lg"
    style="background-color: {color}">
    {nickname}
  </div>
</div>
