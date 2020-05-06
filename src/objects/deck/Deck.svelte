<script>
  export let position;
  export let template;
  export let sizeOffset;

  let { x, y } = $position;
  let { width, height } = template.geometry;
  const fill = '#fff';
  const stroke = '#111';

  $: {
    x = $position.x;
    y = $position.y;
    width = template.geometry.width + $sizeOffset.dx;
    height = template.geometry.height + $sizeOffset.dy;
  }
</script>

<rect {x} {y} {width} {height} {fill} {stroke} />
