<script>
  export let width;
  export let height;
  export let obj;

  import { fly } from 'svelte/transition';

  const size = 400;
</script>

{#if obj.children.length > 1}
  <g data-size="true" in:fly={{ duration: 250, y: -100 }}>
    <foreignObject
      x={width / 2 - size / 2}
      y={height - 200}
      width={size}
      height={size}>
      <div class="w-full h-full p-8">
        <div
          style="font-size: 10rem"
          class="text-white cursor-move hover:bg-gray-500 bg-gray-600 rounded-full shadow-xl w-full h-full
          flex items-center justify-center select-none font-bold text-white">
          {obj.children.length}
        </div>
      </div>
    </foreignObject>
  </g>
{/if}
