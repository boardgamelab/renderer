<script>
  export let players;
  export let seatID;

  import Seat from './Seat.svelte';
  import { getContext } from 'svelte';

  const state = getContext('state');
  const colors = getContext('colors');

  let seatMap = {};
  let entries = [];
  $: {
    seatMap = {};
    $players.forEach((p) => {
      seatMap[p.seatID] = p;
    });

    if ($state && $state.seats) {
      entries = $state.seats;
    }
  }
</script>

<div
  class="absolute select-none top-0 left-0 p-2 w-full flex flex-row
  justify-center">
  {#each entries as seat, index (index)}
    {#if index !== seatID}
      <Seat
        seatID={index}
        player={seatMap[index]}
        {seat}
        color={seatMap[index] && colors[index]} />
    {/if}
  {/each}
</div>
