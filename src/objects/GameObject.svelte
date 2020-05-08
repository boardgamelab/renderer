<script>
  import { drag } from '../gestures/drag.ts';
  import { getContext } from 'svelte';
  import { GetComponent, CheckForDrop } from './game-object.ts';
  import Deck from './deck/Deck.svelte';
  import { Component } from '@boardgamelab/components';
  import Card from './card/Card.svelte';
  import CardHolder from './card-holder/CardHolder.svelte';
  import { MergeOpts } from '../merge.ts';
  import { writable, derived } from 'svelte/store';
  import { tweened } from 'svelte/motion';
  import { expoOut } from 'svelte/easing';

  export let id;

  const { dispatchAction, state, schema, activeObject } = getContext('context');

  let component = null;
  $: component = GetComponent(schema, schema.objects[id], $state.objects[id]);

  const { templateID } = schema.objects[id];
  const template = schema.templates[templateID];

  const sizeOffset = tweened(
    { dx: 0, dy: 0 },
    {
      duration: 300,
      easing: expoOut,
    }
  );
  const rawPosition = tweened({ x: 0, y: 0 }, { duration: 1 });
  const positionOffset = tweened(
    { dx: 0, dy: 0 },
    {
      duration: 300,
      easing: expoOut,
    }
  );
  const position = derived(
    [rawPosition, positionOffset],
    ([$rawPosition, $positionOffset]) => {
      return {
        x: $rawPosition.x + $positionOffset.dx,
        y: $rawPosition.y + $positionOffset.dy,
      };
    }
  );

  let x;
  let y;
  let stateEntry;
  $: {
    stateEntry = $state.objects[id];
    const opts = MergeOpts(schema, $state, id);
    x = opts.x || 0;
    y = opts.y || 0;
    rawPosition.set({ x, y });
  }

  let dragging = false;
  function DragStart() {
    dragging = true;

    // Raise object so that it appears rendered above
    // other objects while being dragged.
    const action = {
      kind: 'raise',
      id,
    };

    dispatchAction(action);
  }

  async function DragEnd() {
    dragging = false;

    const drop = CheckForDrop($state, schema, $rawPosition, id);
    let finalX = $rawPosition.x;
    let finalY = $rawPosition.y;

    if (drop) {
      await rawPosition.set(
        {
          x: drop.x,
          y: drop.y,
        },
        { duration: 150 }
      );

      finalX = drop.x;
      finalY = drop.y;

      dispatchAction({
        kind: 'add-to',
        id,
        parent: drop.id,
      });
    } else {
      dispatchAction({
        kind: 'add-to',
        id,
        parent: null,
      });
    }

    // TODO: Allow updating multiple opts at the same time.

    dispatchAction({
      kind: 'opts',
      id,
      key: 'x',
      value: finalX,
    });

    dispatchAction({
      kind: 'opts',
      id,
      key: 'y',
      value: finalY,
    });
  }

  function Drag({ detail }) {
    // TODO: Highlight drop target.
    // const drop = CheckForDrop($state, schema, $rawPosition, id);

    rawPosition.update(p => ({
      x: p.x + detail.dx,
      y: p.y + detail.dy,
    }));
  }

  function Select(e) {
    activeObject.set(id);
  }
</script>

<g
  {id}
  data-draggable="true"
  on:movestart={DragStart}
  on:moveend={DragEnd}
  on:move={Drag}
  on:touchstart={Select}
  on:mousedown={Select}>
  <svelte:component
    this={component}
    {id}
    isDragging={dragging}
    {stateEntry}
    {template}
    {sizeOffset}
    {position} />
</g>
