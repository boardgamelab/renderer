<script>
  export let id;
  export let x;
  export let y;
  export let color = '#eee';

  import { getContext } from 'svelte';
  const schema = getContext('schema');

  let geometry = { width: 0, height: 0 };

  let { width, height } = geometry;

  $: {
    if (id in $schema.objects) {
      const { templateID } = $schema.objects[id];
      const template = $schema.templates[templateID];
      width = template.geometry.width;
      height = template.geometry.height;
    }
  }
</script>

<rect {x} {y} {width} {height} fill={color} />
