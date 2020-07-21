<script>
  export let players;
  export let state;
  export let addSeat = false;
  export let seatID;

  import Player from './Player.svelte';
  import IconAdd from 'svelte-icons/md/MdAdd.svelte';

  const colors = [
    '#ff8700',
    '#7dacea',
    '#79c37b',
    '#bd87ff',
    '#ecc65b',
    '#e477a9',
  ];
</script>

<div class="absolute select-none top-0 right-0 p-2 flex flex-col items-center">
  {#each Object.entries($players) as [id, player], index (id)}
    <Player
      me={seatID === player.seatID}
      {player}
      {state}
      color={colors[index]} />
  {/each}

  {#if addSeat}
    <div
      class="mt-2 cursor-pointer hover:bg-gray-100 uppercase font-bold
      text-gray-600 border p-1 w-8 h-8 rounded-full">
      <IconAdd />
    </div>
  {/if}
</div>
