<script>
  import { getContext } from 'svelte';
  import { send, receive } from '../utils/crossfade.ts';
  import { ghost } from '../ghost/ghost.ts';
  import { tweened } from 'svelte/motion';

  export let id;
  export let obj;
  export let parentID = null;
  export let draggable = true;

  const { dispatchActions, activeObjects } = getContext('context');

  const highlight = getContext('highlight');
  const toSVGPoint = getContext('to-svg-point');
  const viewOnly = getContext('viewOnly');

  $: active = id in $activeObjects;

  let x = obj.stateVal.x || 0;
  let y = obj.stateVal.y || 0;

  const position = tweened({ x, y }, { duration: 0 });

  $: {
    if (x !== obj.stateVal.x || y !== obj.stateVal.y) {
      x = obj.stateVal.x || 0;
      y = obj.stateVal.y || 0;
      position.set({ x, y }, { duration: 150 });
    }
  }

  let hide = false;

  function Hide() {
    hide = true;
  }

  function Show() {
    hide = false;
  }

  function DropOnTable({ detail }) {
    position.set({
      x: detail.position.x,
      y: detail.position.y,
    });
  }

  $: types = obj.stateVal.types.map(t => {
    if (t.component) return t.component;
    if (t.trait) return t.trait;
    return t;
  }).join(' ');
</script>

<style>
  .hide {
    @apply opacity-0 pointer-events-none;
  }
</style>

<!-- The object has to continue existing while the ghost is
     active so that the ghost is not destroyed. Instead, we hide
     it using CSS -->
<g
  use:ghost={{ id, disable: $viewOnly, onTable: true, parentID, highlight, activeObjects, dispatchActions }}
  transform="translate({$position.x || 0}, {$position.y || 0})"
  class:hide
  out:send={{ key: id, toSVGPoint, parentID }}
  in:receive={{ key: id, toSVGPoint, parentID }}
  data-id={id}
  data-component={obj.stateVal.componentID}
  data-draggable={draggable}
  data-types={types}
  on:table={DropOnTable}
  on:hide={Hide}
  on:show={Show}
  on:movestart
  on:move
  on:moveend>
  <slot {active} {hide} />
</g>
