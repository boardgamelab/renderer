<script>
  import { getContext } from 'svelte';

  import List from '../list/List.svelte';
  import { Component } from '@boardgamelab/components';
  import { GetTemplate } from '../../../utils/template.ts';
  import shortid from 'shortid';
  const schema = getContext('schema');
  const seatID = getContext('seatID');
  const viewOnly = getContext('viewOnly');
  const { state, dispatchActions, activeObjects } = getContext('context');

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

  function FlipCard(id) {
    dispatchActions([
      {
        context: { seatID },
        type: 'tile',
        subtype: 'flip',
        subject: { id },
      },
    ]);
  }

  function RotateCard(id) {
    dispatchActions([
      {
        context: { seatID },
        type: 'tile',
        subtype: 'rotate',
        subject: { id },
      },
    ]);
  }

  function FlipDeck(id) {
    dispatchActions([
      {
        context: { seatID },
        type: 'container',
        subtype: 'flip',
        subject: { id },
      },
    ]);
  }

  function Shuffle(id) {
    dispatchActions([
      {
        context: { seatID },
        type: 'container',
        subtype: 'shuffle',
        subject: { id },
        seed: Math.floor(Math.random() * 1000),
      },
    ]);
  }

  function Behavior(behavior, id) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'advanced',
        subtype: 'multi',
        ...behavior.action,
      },
    ]);
  }

  let items = [];

  function GetBehaviors(id) {
    const template = GetTemplate($schema, $state, id);
    let items = [];
    if (template && template.behaviors) {
      template.behaviors.forEach((behavior) => {
        items.push({
          text: behavior.name,
          fn: () => Behavior(behavior, id),
          color: '#93c3ec',
        });
      });
    }
    return items;
  }

  function GetTopItemActions(id) {
    let items = [];
    if (id in $state.objects) {
      const children = $state.objects[id].children;
      const topItem = children[children.length - 1];

      items = [
        { text: 'rotate', fn: () => RotateCard(topItem) },
        { text: 'flip', fn: () => FlipCard(topItem) },
        ...GetBehaviors(topItem),
      ];
    }
    return items;
  }

  $: {
    items = [];

    if (Object.keys($activeObjects).length === 1) {
      const id = Object.keys($activeObjects)[0];
      const template = GetTemplate($schema, $state, id);

      if (template && template.type === Component.DECK) {
        items = [
          { text: 'shuffle', fn: () => Shuffle(id) },
          { text: 'flip', fn: () => FlipDeck(id) },
        ];

        const topItem = GetTopItemActions(id);
        if (topItem.length) {
          items = [
            { section: 'top item' },
            ...topItem,
            { section: 'container' },
            ...items,
          ];
        }
      }
      if (template && template.type === Component.ANCHOR) {
        items = [
          { text: 'shuffle', fn: () => Shuffle(id) },
          { text: 'flip', fn: () => FlipDeck(id) },
        ];

        const topItem = GetTopItemActions(id);
        if (topItem.length) {
          items = [
            { section: 'top item' },
            ...topItem,
            { section: 'container' },
            ...items,
          ];
        }
      }
      if (template && template.type === Component.CARD) {
        const obj = $state.objects[id];

        let inHand = false;
        if (obj && obj.parent) {
          const p = $state.objects[obj.parent];
          if (p && p.template && p.template.type === Component.HAND) {
            inHand = true;
          }
        }

        if (!inHand) {
          items = [
            { text: 'rotate', fn: () => RotateCard(id) },
            { text: 'flip', fn: () => FlipCard(id) },
          ];
        }
      }

      items = [...items, ...GetBehaviors(id)];
    }

    if (Object.keys($activeObjects).length > 1) {
      const allCards = Object.keys($activeObjects).every((id) => {
        const template = GetTemplate($schema, $state, id);
        if (!template) {
          return false;
        }
        return template.type === Component.CARD;
      });
      if (allCards) {
        items = [{ text: 'group', fn: MakeDeck }];
      }
    }
  }
</script>

<style>
  .menu {
    @apply transform duration-100 translate-x-32 fixed z-50 top-0 right-0 h-full m-2 pointer-events-none flex flex-col justify-center;
  }

  .menu.show {
    @apply translate-x-0;
  }

  @screen md {
    .menu {
      @apply h-full;
    }
  }
</style>

{#if !$viewOnly}
  <div class="menu" class:show={items.length}>
    <span class="pointer-events-auto">
      <List {items} />
    </span>
  </div>
{/if}
