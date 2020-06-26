<script>
  export let handID;

  import { getContext } from 'svelte';

  import { Component } from '@boardgamelab/components';
  import { GetTemplate } from '../../../utils/template.ts';
  import shortid from 'shortid';
  const schema = getContext('schema');
  const seatID = getContext('seatID');
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
        context: { seatID },
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
        context: { seatID },
        type: 'position',
        subject: { id: newID },
        x: firstCard.x,
        y: firstCard.y,
      },
    ];

    Object.keys($activeObjects).forEach((id) => {
      actions.push({
        context: { seatID },
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
        context: { seatID },
        type: 'card',
        subtype: 'flip',
        subject: { id },
      },
    ]);
  }

  function RotateCard() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        context: { seatID },
        type: 'card',
        subtype: 'rotate',
        subject: { id },
      },
    ]);
  }

  function FlipDeck() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        context: { seatID },
        type: 'deck',
        subtype: 'flip',
        subject: { id },
      },
    ]);
  }

  function Shuffle() {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        context: { seatID },
        type: 'deck',
        subtype: 'shuffle',
        subject: { id },
        seed: Math.floor(Math.random() * 1000),
      },
    ]);
  }

  function Behavior(behavior) {
    const id = Object.keys($activeObjects)[0];
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'advanced',
        subtype: 'multi',
        ...behavior.action,
      },
    ]);
  }

  // function Custom() {
  //   const id = Object.keys($activeObjects)[0];
  //   dispatchActions([
  //     {
  //       context: { seatID, subject: { id } },
  //       type: 'advanced',
  //       subtype: 'multi',
  //       actions: [
  //         {
  //           type: 'advanced',
  //           subtype: 'conditional',
  //           condition: {
  //             boolean: {
  //               property: {
  //                 type: 'container',
  //                 subject: { id },
  //                 property: {
  //                   boolean: {
  //                     type: 'is-empty',
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           action: {
  //             seatID,
  //             type: 'add-to',
  //             subject: { id: handID },
  //             dest: { id },
  //           },
  //         },
  //         {
  //           type: 'add-to',
  //           subject: {
  //             reference: {
  //               type: 'container',
  //               subject: { inherit: {} },
  //               reference: {
  //                 type: 'top-child',
  //               },
  //             },
  //           },
  //           dest: { reference: { type: 'hand' } },
  //         },
  //       ],
  //     },
  //   ]);
  // }

  let menu = null;
  let behaviors = [];
  $: {
    menu = null;
    behaviors = [];

    if (Object.keys($activeObjects).length === 1) {
      const id = Object.keys($activeObjects)[0];
      const template = GetTemplate($schema, $state, id);

      if (template && template.behaviors) {
        behaviors = template.behaviors;
      }

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
      const allCards = Object.keys($activeObjects).every((id) => {
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
    {/if}

    {#if menu === CARDS}
      <div on:click={MakeDeck} class="item">group</div>
    {/if}

    {#if menu === CARD}
      <div on:click={RotateCard} class="item">rotate</div>
      <div on:click={FlipCard} class="item">flip</div>
    {/if}

    {#each behaviors as behavior}
      <div on:click={() => Behavior(behavior)} class="item">
        {behavior.name}
      </div>
    {/each}
  </div>
{/if}
