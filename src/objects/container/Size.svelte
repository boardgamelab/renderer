<script>
  export let width;
  export let height;
  export let obj;

  import { fly } from 'svelte/transition';
</script>

{#if obj.children.length > 1}
  <g in:fly={{ duration: 250, y: -100 }}>
    <foreignObject
      x={width / 2 - 100}
      y={height - 60}
      width="200"
      height="200">
      <div class="w-full h-full p-8">
        <div
          style="font-size: 3rem"
          class="text-white bg-gray-600 rounded-full shadow-xl w-full h-full
          flex items-center justify-center select-none font-bold text-white">
          {obj.children.length}
        </div>
      </div>
    </foreignObject>
  </g>
{/if}
