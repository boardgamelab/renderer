<script>
  export let id;
  export let obj;
  export let position;
  export let active = false;

  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { selectionColor } from '../../defaults.ts';
  import Snap from './Snap.svelte';

  const renderer = getContext('renderer');
  const highlight = getContext('highlight');

  const component = obj.component;
  const width = component.layout.geometry.width;
  const height = component.layout.geometry.height;

  const rotation = tweened(0, { duration: 200 });

  async function ShuffleAnimation() {
    await rotation.update((r) => r + 359);
    await rotation.set(0, { duration: 1 });
  }

  let shuffleID = null;
  $: {
    const newID = obj.stateVal.shuffleID;
    if (newID && newID !== shuffleID) {
      ShuffleAnimation();
      shuffleID = newID;
    }
  }
</script>

<g
  data-id={id}
  data-preview="true"
  data-selectable="true"
  data-component={component.id}
  transform="rotate({$rotation}, {width / 2}, {height / 2})">

  <rect
    x={10}
    y={10}
    width={width - 20}
    height={height - 20}
    stroke="#aaa"
    stroke-width={5}
    fill="transparent" />

  {#if renderer && obj.instance}
    <svelte:component
      this={renderer}
      {width}
      {height}
      {component}
      instance={obj.instance} />
  {/if}

  {#if id in $highlight || active}
    <rect
      in:fade|local={{ duration: 150 }}
      x={-10}
      y={-10}
      width={width + 20}
      height={height + 20}
      fill="none"
      stroke-width="10"
      stroke={selectionColor} />
  {/if}

  {#if obj.snapZones.length}
    {#each obj.snapZones as zone (zone.id)}
      <g transform="translate({zone.stateVal.x} {zone.stateVal.y})">
        <Snap id={zone.id} obj={zone} {active} {position} />
      </g>
    {/each}
  {/if}

</g>
