<script>
  export let seats;
  export let state;
  export let seatID;

  import Seat from './Seat.svelte';
  import { getContext } from 'svelte';

  const colors = getContext('colors');

  let entries = [];
  $: {
    entries = Object.entries($seats).sort((a, b) => {
      return a[1].seatID < b[1].seatID ? -1 : 1;
    });
  }
</script>

<div
  class="absolute top-0 left-0 w-full flex flex-row items-start justify-center">
  {#each entries as [id, seat], index (id)}
    {#if seat.seatID !== seatID}
      <Seat {seat} {state} color={colors[index]} />
    {/if}
  {/each}
</div>
