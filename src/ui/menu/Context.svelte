<script>
  import { getContext } from 'svelte';

  import { Component } from '@boardgamelab/components';
  import { GetTemplate } from '../../utils/template.ts';
  import shortid from 'shortid';
  const { schema, state, dispatchActions, activeObjects } = getContext(
    'context'
  );

  const DECK = 'deck';
  const CARDS = 'cards';

  function MakeDeck() {
    const firstCardID = Object.keys($activeObjects)[0];
    const firstCard = $state.objects[firstCardID];
    const firstCardTemplate = GetTemplate(schema, $state, firstCardID);
    const newID = shortid();

    const actions = [
      {
        kind: 'create',
        id: newID,
        template: {
          type: Component.DECK,
          id: newID,
          geometry: {
            width: firstCardTemplate.geometry.width,
            height: firstCardTemplate.geometry.height,
          },
        },
      },
      {
        kind: 'position',
        id: newID,
        x: firstCard.x,
        y: firstCard.y,
      },
    ];

    Object.keys($activeObjects).forEach(id => {
      actions.push({
        kind: 'add-to',
        id,
        parent: newID,
      });
    });

    dispatchActions(actions);

    activeObjects.set({ [newID]: true });
  }

  function Shuffle() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        kind: 'shuffle',
        id,
      },
    ]);
  }

  let menu = null;
  $: {
    menu = null;

    if (Object.keys($activeObjects).length === 1) {
      const id = Object.keys($activeObjects)[0];
      if (
        id in $state.objects &&
        $state.objects[id].children &&
        $state.objects[id].children.length
      ) {
        menu = DECK;
      }
    }

    if (Object.keys($activeObjects).length > 1) {
      const allCards = Object.keys($activeObjects).every(id => {
        const template = GetTemplate(schema, $state, id);
        return (
          template.type === Component.CARD || template.type === Component.DECK
        );
      });
      if (allCards) {
        menu = CARDS;
      }
    }
  }
</script>

<style>
  .item {
    @apply text-xs bg-white select-none p-1 px-4 border border-gray-300 rounded cursor-pointer transition duration-200 pointer-events-auto;
  }

  .item:hover {
    @apply bg-gray-100;
  }

  .item:active {
    @apply bg-gray-300;
  }
</style>

{#if menu}
  <div class="p-4 flex flex-row justify-center pointer-events-none">
    {#if menu === DECK}
      <div on:click={Shuffle} class="item">shuffle</div>
    {/if}

    {#if menu === CARDS}
      <div on:click={MakeDeck} class="item">group</div>
    {/if}
  </div>
{/if}
