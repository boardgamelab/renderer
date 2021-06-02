<script>
  export let api;
  export let show = false;

  import { onMount, tick } from 'svelte';
  import { scale } from 'svelte/transition';

  let ref;
  let viewBox = '';

  onMount(() => {
    api.set({
      show: async (target, opts = {}) => {
        const bbox = target.getBBox();
        viewBox = opts.onTable
          ? `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
          : '';

        show = true;
        await tick();
        ref.innerHTML = opts.onTable ? target.innerHTML : target.outerHTML;
      },

      hide: () => {
        show = false;
      },
    });
  });
</script>

{#if show}
  <div
    transition:scale|local={{ duration: 100 }}
    class="pointer-events-none absolute inset-0 p-2 md:p-64">
    <svg
      bind:this={ref}
      width="100%"
      height="100%"
      class="overflow-visible"
      viewBox={viewBox ? viewBox : undefined} />
  </div>
{/if}
