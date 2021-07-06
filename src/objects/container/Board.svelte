<script>
  export let board;
  export let state;
  export let snapKeySuffix = "";

  import { getContext } from 'svelte';
  import Snap from './Snap.svelte';

  const schema = getContext("schema");

  import { GetGameObject } from "../game-object.ts";
  import Render from "../../../../src/components/template/Render.svelte";

  const width = board.geometry.width;
  const height = board.geometry.height;

  $: snaps = board
    .faces
    .flatMap((face) => face.layers)
    .flatMap((layer) => Object.values(layer.parts || {}))
    .filter((part) => part.snap)
    .map(snap => GetGameObject($schema, $state, `${snap.id}:${snapKeySuffix}`))
    .filter(obj => obj);
</script>

<g>
  <Render {width} {height} {board} highlightOnHover={false} />

  {#if snaps.length}
    {#each snaps as zone (zone.id)}
      <g transform="translate({zone.stateVal.x} {zone.stateVal.y})">
        <Snap id={zone.id} obj={zone} />
      </g>
    {/each}
  {/if}
</g>
