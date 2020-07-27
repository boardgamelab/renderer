<script>
  export let players;
  export let state;
  export let seatID;

  import Player from './Player.svelte';
  import { getContext } from 'svelte';

  const colors = getContext('colors');

  let entries = [];
  $: {
    entries = Object.entries($players);
  }
</script>

<div
  class="absolute select-none top-0 left-0 p-2 w-full flex flex-row
  justify-center">
  {#each entries as [id, player], index (id)}
    {#if player.seatID !== seatID}
      <Player {player} {state} color={colors[index]} />
    {/if}
  {/each}
</div>
