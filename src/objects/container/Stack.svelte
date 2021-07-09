<script>
  export let id;
  export let obj;
  export let active = false;
  export let forceFaceDown = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import GameObject from '../GameObject.svelte';
  import Size from './Size.svelte';

  const highlight = getContext('highlight');

  let width = 0;
  let height = 0;

  const rotation = tweened(0, { duration: 100 });

  async function ShuffleAnimation() {
    await rotation.update((r) => r + 25, { duration: 100 });
    await rotation.update((r) => r - 50, { duration: 100 });
    await rotation.update((r) => r + 50, { duration: 100 });
    await rotation.update((r) => r - 25, { duration: 100 });
  }

  let shuffleID = obj.stateVal.shuffleID;
  $: {
    const newID = obj.stateVal.shuffleID;
    if (newID && newID !== shuffleID) {
      ShuffleAnimation();
      shuffleID = newID;
    }

    if (obj.children.length) {
      const firstChild = obj.children[0];

      if (firstChild.component) {
        const { width: w, height: h } = firstChild.component.layout.geometry;

        if (w) {
          width = w;
        }

        if (h) {
          height = h;
        }
      }
    }
  }

  $: types = obj.stateVal.types
    .map((t) => {
      if (t.component) return t.component;
      if (t.trait) return t.trait;
      return t;
    })
    .join(' ');
</script>

<g
  data-id={id}
  data-selectable="true"
  data-droppable="true"
  data-types={types}
  transform="translate({$rotation * 2}) rotate({$rotation}, {width /
    2}, {height / 2})"
>
  {#if obj.children.length}
    {#each obj.children.slice(-10) as child (child.id)}
      <GameObject
        id={child.id}
        obj={child}
        parentID={id}
        selectable={true}
        droppable={false}
        {forceFaceDown}
      />
    {/each}

    <Size {obj} {width} {height} highlight={id in $highlight || active} />
  {/if}
</g>
