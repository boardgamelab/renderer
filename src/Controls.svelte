<script>
  export let zoomLevel;

  import ZoomIn from 'svelte-icons/md/MdAdd.svelte';
  import ZoomOut from 'svelte-icons/md/MdRemove.svelte';
</script>

<style>
  .control {
    @apply cursor-pointer bg-white hover:bg-gray-200 border w-8 p-2 rounded-full shadow;
  }
</style>

<div class="hidden absolute top-0 right-0 grid gap-4 m-8">
  <div
    class="control"
    on:click={() => {
      zoomLevel.update((z) => z / 2);
    }}>
    <ZoomIn />
  </div>
  <div
    class="control"
    on:click={() => {
      zoomLevel.update((z) => z * 2);
    }}>
    <ZoomOut />
  </div>
</div>
