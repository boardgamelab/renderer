<script>
  export let stack = false;
  export let width;
  export let height;
  export let obj;
  export let highlight = false;

  import { fly } from 'svelte/transition';

  $: size = Math.min(300, Math.round(width / 2));
  const min = stack ? 0 : 1;
</script>

{#if obj.children.length > min}
  <g data-size="true" in:fly={{ duration: 250, y: -100 }}>
    <foreignObject
      x={width / 2 - size / 2}
      y={height / 2 - size / 2}
      width={size}
      height={size}>
      <div class="w-full h-full">
        <div
          style="font-size: {size / 30}rem"
          class:highlight
          class="size">
          {stack ? obj.children.length + 1 : obj.children.length}
        </div>
      </div>
    </foreignObject>
  </g>
{/if}

<style>
  .size {
    @apply text-white opacity-75 cursor-move bg-gray-600 text-white rounded-full w-full h-full flex items-center justify-center select-none font-bold;
  }

  .size:hover {
    @apply opacity-100;
  }

  .highlight, .highlight:hover {
    @apply bg-primary text-white opacity-100;
  }

</style>
