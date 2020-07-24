<script>
  export let me = false;
  export let state;
  export let player;
  export let color = '#aaa';

  import IconPerson from 'svelte-icons/md/MdPerson.svelte';
  import { send, receive } from '../utils/crossfade.ts';

  let children = [];

  $: {
    children = [];
    const { seatID } = player;
    if ($state && $state.seats && seatID in $state.seats) {
      const { handID } = $state.seats[seatID];
      if (handID in $state.objects) {
        children = $state.objects[handID].children;
      }
    }
  }
</script>

<div
  title={player.nickname}
  class="cursor-pointer m-4 flex flex-row items-center">
  <div
    style="border-color: {color}; background: linear-gradient(45deg, #ddd 0%,
    #fff 100%);"
    class="rounded-full bg-white shadow-lg w-8 h-8 border-4 border-gray-500
    transform scale-150 p-1 text-gray-600">
    <IconPerson />
  </div>

  <div
    style="background: {color}"
    class="rounded-full text-xs text-white font-bold transform translate-y-4
    -translate-x-2 w-6 h-6 g-primary flex items-center justify-center">
    {children.length}
  </div>

  {#if !me}
    <span>
      {#each children as child (child)}
        <span
          out:send={{ key: child, animate: false }}
          in:receive={{ key: child, animate: false }} />
      {/each}
    </span>
  {/if}
</div>
