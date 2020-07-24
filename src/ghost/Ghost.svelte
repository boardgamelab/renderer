<script>
  export let api;
  export let show = false;

  import { getContext } from 'svelte';

  const toSVGPoint = getContext('to-svg-point');
  import { onMount, tick } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { send } from '../utils/crossfade';

  let ref;
  let ghostPos = { x: 0, y: 0 };
  let ghostOffset = tweened({ dx: 0, dy: 0 }, { duration: 0 });
  let ghostID = null;
  let width = 100;
  let height = 100;

  onMount(() => {
    api.set({
      show: async (target) => {
        const rect = target.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        ghostID = target.dataset.id;
        show = true;
        await tick();
        ref.innerHTML = target.outerHTML;
      },

      revert: async () => {
        await ghostOffset.set({ dx: 0, dy: 0 }, { duration: 200 });
      },

      hide: () => {
        show = false;
      },

      setPosition: (x, y) => {
        ghostPos = { x, y };
        ghostOffset.set({ dx: 0, dy: 0 });
      },

      move: (dx, dy) => {
        ghostOffset.set({ dx, dy });
      },
    });
  });
</script>

{#if show}
  <svg
    {width}
    {height}
    bind:this={ref}
    out:send={{ key: ghostID, toSVGPoint, ghost: true }}
    style="transform: translate3d({ghostPos.x + $ghostOffset.dx}px, {ghostPos.y + $ghostOffset.dy}px,
    0)"
    class="pointer-events-none fixed top-0 left-0" />
{/if}
