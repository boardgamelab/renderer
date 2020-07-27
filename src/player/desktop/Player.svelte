<script>
  export let state;
  export let player;
  export let color;

  import HandObject from '../../hand/HandObject.svelte';
  import { GetGameObject } from '../../objects/game-object.ts';
  import { getContext } from 'svelte';

  const schema = getContext('schema');

  let children = [];

  $: {
    children = [];
    const { seatID } = player;
    if ($state && $state.seats && seatID in $state.seats) {
      const { handID } = $state.seats[seatID];
      if (handID in $state.objects) {
        children = $state.objects[handID].children;
      }
    }
  }
</script>

<div
  class="select-none mx-2 border border-t-0 rounded-bl-lg rounded-br-lg w-3/4
  md:w-64 shadow-lg overflow-none"
  title={player.nickname}
  data-droppable="true"
  data-id={player.seatID}>
  <div
    style="padding-left: 50px"
    class="p-2 bg-white flex flex-row items-center justify-center">
    {#each children as child, index (child)}
      <HandObject
        small={true}
        id={child}
        handID={player.seatID}
        forceFaceDown={true}
        {index}
        obj={GetGameObject($schema, $state, child)} />
    {/each}
  </div>

  <div
    class="h-6 center text-xs text-white rounded-bl-lg rounded-br-lg"
    style="background-color: {color}">
    {player.nickname || ''}
  </div>
</div>
