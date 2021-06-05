<script>
  export let content; 
  export let viewBox;
  export let position;
  export let width;
  export let height;
</script>

<svg
  {width}
  {height}
  {viewBox}
  id="ghost"
  style="transform: translate3d({position.x}px, {position.y}px,
  0)"
  class="overflow-visible pointer-events-none fixed top-0 left-0">
  {@html content}
</svg>
