<script>
  export let seats;
  export let state;
  export let seatID;

  import { getContext, setContext } from 'svelte';
  import Mobile from './mobile/Seats.svelte';
  import Desktop from './desktop/Seats.svelte';

  const colors = [
    '#ff8700',
    '#7dacea',
    '#79c37b',
    '#bd87ff',
    '#ecc65b',
    '#e477a9',
  ];

  setContext('colors', colors);

  const isMobile = getContext('isMobile');
</script>

{#if $isMobile}
  <Mobile {seats} {state} {seatID} />
{:else}
  <Desktop {seats} {state} {seatID} />
{/if}
