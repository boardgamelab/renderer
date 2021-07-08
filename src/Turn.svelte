<script>
  export let seatID;
  export let ctx;
  export let game;

  import { onMount, getContext } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  const { dispatchActions } = getContext('context');
  const schema = getContext('schema');

  let banner = false;
  let currentPlayer = null;

  function ShowBanner() {
    if (seatID === currentPlayer) {
      banner = true;
      setTimeout(() => {
        banner = false;
      }, 1000);
    }
  }

  $: {
    if (ctx.currentPlayer !== currentPlayer) {
      currentPlayer = ctx.currentPlayer;
      ShowBanner();
    }
  }

  onMount(() => {
    ShowBanner();
  });

  function EndTurn() {
    dispatchActions([
      {
        type: 'event',
        subtype: 'endTurn',
      },
    ]);
  }

  function Pass() {
    dispatchActions([
      {
        type: 'event',
        subtype: 'pass',
      },
    ]);
  }
</script>

{#if ctx && game && game.turnOrder !== 'none'}
  {#if seatID === ctx.currentPlayer}
    <div class="absolute bottom-0 right-0 m-4 grid gap-2">
      <div on:click={EndTurn} class="event">End Turn</div>
      {#if game.turnOrder == 'passing'}
        <div on:click={Pass} class="event">Pass</div>
      {/if}
    </div>

    {#if banner}
      <div
        in:scale={{ duration: 400 }}
        out:fade={{ duration: 200 }}
        class="absolute inset-0 center text-6xl font-bold text-gray-600
        pointer-events-none"
      >
        Your Turn
      </div>
    {/if}
  {/if}
{/if}

<style>
  .event {
    @apply cursor-pointer flex items-center justify-center rounded transition duration-200 p-2 bg-gray-700 font-bold text-white shadow-lg;
  }

  .event:hover {
    @apply opacity-75;
  }
</style>
