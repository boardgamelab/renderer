<script>
  import { getContext } from 'svelte';

  import { Component } from '@boardgamelab/components';
  import { GetTemplate } from '../../utils/template.ts';
  import shortid from 'shortid';
  const schema = getContext('schema');
  const { state, dispatchActions, activeObjects } = getContext('context');

  const DECK = 'deck';
  const ANCHOR = 'anchor';
  const CARDS = 'cards';
  const CARD = 'card';

  function MakeDeck() {
    const firstCardID = Object.keys($activeObjects)[0];
    const firstCard = $state.objects[firstCardID];
    const firstCardTemplate = GetTemplate($schema, $state, firstCardID);
    const newID = shortid();

    const actions = [
      {
        type: 'create',
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
        type: 'position',
        subject: { id: newID },
        x: firstCard.x,
        y: firstCard.y,
      },
    ];

    Object.keys($activeObjects).forEach(id => {
      actions.push({
        type: 'add-to',
        subject: { id },
        dest: { id: newID },
      });
    });

    dispatchActions(actions);

    activeObjects.set({ [newID]: true });
  }

  function FlipCard() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        type: 'card',
        subtype: 'flip',
        id,
      },
    ]);
  }

  function RotateCard() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        type: 'card',
        subtype: 'rotate',
        id,
      },
    ]);
  }

  function FlipDeck() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        type: 'deck',
        subtype: 'flip',
        id,
      },
    ]);
  }

  function Shuffle() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        type: 'deck',
        subtype: 'shuffle',
        id,
        seed: Math.floor(Math.random() * 1000),
      },
    ]);
  }

  function Custom() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        type: 'custom',
        actions: [
          {
            type: 'deck',
            subtype: 'flip',
            id,
          },
        ],
      },
    ]);
  }

  let menu = null;
  $: {
    menu = null;

    if (Object.keys($activeObjects).length === 1) {
      const id = Object.keys($activeObjects)[0];
      const template = GetTemplate($schema, $state, id);
      if (template && template.type === Component.DECK) {
        menu = DECK;
      }
      if (template && template.type === Component.ANCHOR) {
        menu = ANCHOR;
      }
      if (template && template.type === Component.CARD) {
        menu = CARD;
      }
    }

    if (Object.keys($activeObjects).length > 1) {
      const allCards = Object.keys($activeObjects).every(id => {
        const template = GetTemplate($schema, $state, id);
        if (!template) {
          return false;
        }
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
    @apply text-xs uppercase rounded text-gray-800 font-bold select-none p-1 px-4 cursor-pointer transition duration-200 pointer-events-auto;
  }

  .item:hover {
    @apply bg-gray-100;
  }

  .item:active {
    @apply bg-gray-300;
  }
</style>

{#if menu}
  <div class="p-4 flex flex-row justify-center">
    {#if menu === DECK}
      <div on:click={Shuffle} class="item">shuffle</div>
      <div on:click={FlipDeck} class="item">flip</div>
    {/if}

    {#if menu === ANCHOR}
      <div on:click={Shuffle} class="item">shuffle</div>
      <div on:click={FlipDeck} class="item">flip</div>
      <div on:click={Custom} class="item">custom</div>
    {/if}

    {#if menu === CARDS}
      <div on:click={MakeDeck} class="item">group</div>
    {/if}

    {#if menu === CARD}
      <div on:click={RotateCard} class="item">rotate</div>
      <div on:click={FlipCard} class="item">flip</div>
    {/if}
  </div>
{/if}
