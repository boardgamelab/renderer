<script>
  export let players;
  export let state;
  export let seatID;

  import Player from './Player.svelte';
  import { getContext } from 'svelte';

  const colors = getContext('colors');

  let entries = [];
  $: {
    entries = Object.entries($players).sort((a, b) => {
      return a[1].seatID < b[1].seatID ? -1 : 1;
    });
  }
</script>

<div
  class="absolute top-0 left-0 w-full flex flex-row items-start justify-center">
  {#each entries as [id, player], index (id)}
    {#if player.seatID !== seatID}
      <Player {player} {state} color={colors[index]} />
    {/if}
  {/each}
</div>
