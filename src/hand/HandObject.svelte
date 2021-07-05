<script>
  // The ID of the hand container.
  export let handID;
  // The index of this object in the hand container.
  export let index;
  // The ID of the object.
  export let id;
  // The state value of the object.
  export let obj;

  export let small = false;

  export let splay = false;

  export let forceFaceUp = true;

  export let forceFaceDown = false;

  import Tile from '../objects/tile/Tile.svelte';
  import { ghost } from '../ghost/ghost.ts';
  import { send, receive } from '../utils/crossfade.ts';
  import { createEventDispatcher, getContext } from 'svelte';

  const { activeObjects, dispatchActions } = getContext('context');
  const toSVGPoint = getContext('to-svg-point');
  const highlight = getContext('highlight');
  const viewOnly = getContext('viewOnly');
  const isMobile = getContext('isMobile');
  const dispatch = createEventDispatcher();

  // Add a margin around the SVG container so that things
  // like borders can be seen.
  const margin = 20;

  $: mobileMultiplier = $isMobile ? 0.5 : 1;

  let hide = false;

  function Hide() {
    hide = true;
  }

  function Show() {
    hide = false;
  }

  let ref;

  let geometry = obj.component.layout.geometry;

  function DragStart({ detail }) {
    dispatch('movestart', {
      ...detail,
      index,
      id,
      ref: this,
    });
  }

  const Drag = ({ detail }) => {
    dispatch('move', detail);
  };

  const DragEnd = () => {
    dispatch('moveend', { index });
  };

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

  .splay {
    margin-left: -20px;
  }

  @screen md {
    .splay {
      margin-left: -40px;
    }
  }
</style>

<div class:splay class:small class:hide>
  <svg
    class="overflow-visible hand-object"
    use:ghost={{ id, disable: $viewOnly, parentID: handID, highlight, activeObjects, dispatchActions }}
    on:hide={Hide}
    on:show={Show}
    out:send={{ key: id, toSVGPoint, hand: true }}
    in:receive={{ key: id, toSVGPoint, hand: true }}
    data-id={id}
    data-preview="true"
    data-selectable="true"
    data-draggable="true"
    data-types={types}
    on:movestart={DragStart}
    on:moveend={DragEnd}
    on:move={Drag}
    width={(small ? 50 : 100) * mobileMultiplier}
    viewBox="-{margin} -{margin}
    {geometry.width + 2 * margin}
    {geometry.height + 2 * margin}"
    xmlns="http://www.w3.org/2000/svg">
    <g bind:this={ref}>
      <Tile
        {id}
        {obj}
        droppable={false}
        {forceFaceUp}
        {forceFaceDown}
        active={id in $activeObjects} />
    </g>
  </svg>
</div>
