<script>
  export let x;
  export let y;
  export let width = 150;
  export let height = 200;
  export let color = '#eee';
</script>

<rect {x} {y} {width} {height} fill={color} />
