<script>
  export let x;
  export let y;
  export let style = {};

  const width = style.width || 150;
  const height = style.height || 200;
  const fill = style.fill || '#eee';
  const stroke = style.stroke || '#888';

  // import img from './cards.svg';
</script>

<rect {x} {y} {width} {height} {fill} {stroke} />
