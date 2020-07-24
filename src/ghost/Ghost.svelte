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

  onMount(() => {
    api.set({
      show: async (content) => {
        show = true;
        await tick();
        ref.innerHTML = content;
      },

      setID: (id) => {
        ghostID = id;
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
  <div
    bind:this={ref}
    out:send={{ key: ghostID, toSVGPoint, ghost: true }}
    style="transform: translate3d({ghostPos.x + $ghostOffset.dx}px, {ghostPos.y + $ghostOffset.dy}px,
    0)"
    class="pointer-events-none fixed top-0 left-0" />
{/if}
