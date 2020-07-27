<script>
  export let players;
  export let state;
  export let seatID;

  import { getContext, setContext } from 'svelte';
  import PlayersM from './mobile/Players.svelte';
  import Players from './desktop/Players.svelte';

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
  <PlayersM {players} {state} {seatID} />
{:else}
  <Players {players} {state} {seatID} />
{/if}
