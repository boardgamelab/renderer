<script>
  export let id = 'game';
  export let board;
  export let state;
  export let snapKeySuffix = '';

  import { getContext } from 'svelte';
  import Snap from './Snap.svelte';

  const schema = getContext('schema');
  const seatID = getContext('seatID');
  const { dispatchActions } = getContext('context');

  import { GetGameObject } from '../game-object.ts';
  import Render from '../../../../src/components/template/Render.svelte';

  const width = board.geometry.width.value;
  const height = board.geometry.height.value;

  function OnPartClick({ detail: part }) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'rule',
        ruleID: part.clickable.handler,
      },
    ]);
  }

  $: snaps = board.faces
    .flatMap((face) => face.layers)
    .flatMap((layer) => Object.values(layer.parts || {}))
    .filter((part) => part.snap)
    .map((snap) =>
      GetGameObject($schema, $state, `${snap.id}:${snapKeySuffix}`)
    )
    .filter((obj) => obj);
</script>

<g id={snapKeySuffix}>
  <Render
    on:partclick={OnPartClick}
    {width}
    {height}
    {board}
    highlightOnHover={false}
  />

  {#if snaps.length}
    {#each snaps as zone (zone.id)}
      <g transform="translate({zone.stateVal.x} {zone.stateVal.y})">
        <Snap id={zone.id} obj={zone} />
      </g>
    {/each}
  {/if}
</g>
