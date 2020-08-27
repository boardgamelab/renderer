<script>
  export let seatID;
  export let ctx;

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
</script>

{#if ctx && $schema.game.turnOrder !== 'none'}
  {#if seatID === ctx.currentPlayer}
    <div class="absolute bottom-0 right-0 m-4">
      <div
        on:click={EndTurn}
        class="rounded transition duration-200 cursor-pointer hover:opacity-75
        p-2 bg-gray-700 font-bold text-white shadow-lg">
        <div>End Turn</div>
      </div>
    </div>

    {#if banner}
      <div
        in:scale={{ duration: 400 }}
        out:fade={{ duration: 200 }}
        class="absolute inset-0 center text-6xl font-bold text-gray-600
        pointer-events-none">
        Your Turn
      </div>
    {/if}
  {/if}

  <div class="hidden md:block absolute top-0 right-0 m-4">
    <div>Turn {ctx.turn + 1}</div>
  </div>
{/if}
