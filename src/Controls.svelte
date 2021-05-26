<script>
  export let zoomLevel;
  export let reset;

  import ZoomIn from 'svelte-icons/md/MdAdd.svelte';
  import ZoomOut from 'svelte-icons/md/MdRemove.svelte';
  import MdMyLocation from 'svelte-icons/md/MdMyLocation.svelte'
</script>

<style>
  .control {
    @apply cursor-pointer bg-white hover:bg-gray-200 w-8 p-2 rounded-full;
  }
</style>

<div class="hidden md:grid absolute bottom-0 right-0 gap-2 m-8">
  <div
    class="control"
    on:click={() => {
      zoomLevel.update(z => z / 2);
    }}>
    <ZoomIn />
  </div>

  <div
    class="control"
    on:click={() => { reset(150); }}>
    <MdMyLocation />
  </div>

  <div
    class="control"
    on:click={() => {
      zoomLevel.update(z => z * 2);
    }}>
    <ZoomOut />
  </div>
</div>
