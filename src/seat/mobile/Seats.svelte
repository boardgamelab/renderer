<script>
  export let seats;
  export let state;
  export let seatID;

  import Seat from './Seat.svelte';
  import { getContext } from 'svelte';

  const colors = getContext('colors');

  let entries = [];
  $: {
    entries = Object.entries($seats);
  }
</script>

<div
  class="absolute select-none top-0 left-0 p-2 w-full flex flex-row
  justify-center">
  {#each entries as [id, seat], index (id)}
    {#if seat.seatID !== seatID}
      <Seat {seat} {state} color={colors[index]} />
    {/if}
  {/each}
</div>
