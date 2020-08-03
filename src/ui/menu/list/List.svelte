<script>
  export let items = [];

  import Icon from './Icon.svelte';

  let expanded = false;
  function Expand() {
    expanded = true;
  }

  $: {
    if (!items.length) {
      expanded = false;
    }

    let hotkey = 1;
    items = items.map((item) => {
      if (!item.section) {
        item.hotkey = (hotkey++).toString();
      }
      return item;
    });
  }

  function OnKey(e) {
    items
      .filter((item) => item.fn && item.hotkey === e.key)
      .forEach((item) => {
        item.fn();
      });
  }
</script>

<style>
  .hide {
    @apply hidden;
  }

  .expanded {
    @apply block;
  }
</style>

<svelte:window on:keypress={OnKey} />

<div
  on:click={Expand}
  class:hide={expanded}
  class="md:hidden w-10 bg-white border p-1 rounded-full text-gray-800 shadow-lg">
  <Icon hollow={false} />
</div>

<div
  class:expanded
  class="hidden md:block border rounded select-none shadow-lg text-sm bg-white">
  {#each items as item}
    <div on:click={item.fn}>
      {#if item.section}
        <div
          class="p-1 center uppercase w-full text-xs text-gray-100 bg-gray-800">
          {item.section}
        </div>
      {:else}
        <div
          class="cursor-pointer p-2 flex flex-row items-center hover:bg-gray-200">
          <div class="mr-2 font-bold">
            {#if item.hotkey}{item.hotkey}{/if}
          </div>
          <div class="w-6 mr-2">
            {#if item.icon}
              <svelte:component this={item.icon} />
            {:else}
              <Icon color={item.color} />
            {/if}
          </div>
          <div>{item.text}</div>
          <div class="w-6" />
        </div>
      {/if}
    </div>
  {/each}
</div>
