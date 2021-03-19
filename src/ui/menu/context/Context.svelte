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
        createID: newID,
        template: {
          type: Component.DECK,
          id: newID,
          layout: {
            geometry: {
              width: firstCardTemplate.layout.geometry.width,
              height: firstCardTemplate.layout.geometry.height,
            },
          },
        },
      },
      {
        context: { seatID, subject: { id: newID } },
        type: 'object',
        position: {
          x: firstCard.x,
          y: firstCard.y,
        },
      },
    ];

    Object.keys($activeObjects).forEach((id) => {
      actions.push({
        type: 'object',
        context: { seatID, subject: { id } },
        move: {
          dest: { id: newID },
        },
      });
    });

    dispatchActions(actions);

    activeObjects.set({ [newID]: true });
  }

  function FlipCard(id) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'tile',
        flip: null,
      },
    ]);
  }

  function RotateCard(id) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'tile',
        rotate: null,
      },
    ]);
  }

  function FlipDeck(id) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'container',
        flip: null,
      },
    ]);
  }

  function Shuffle(id) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'container',
        shuffle: {},
      },
    ]);
  }

  function Rule(rule, id) {
    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'rule',
        id: rule.id,
      },
    ]);
  }

  let items = [];

  function GetRules(id) {
    const template = GetTemplate($schema, $state, id);
    let items = [];
    if (template && template.rules) {
      template.rules
        .map(rule => $schema.automation.rules[rule])
        .forEach((rule) => {
          items.push({
            text: rule.name,
            fn: () => Rule(rule, id),
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

      if (topItem) {
        items = [
          { text: 'rotate', fn: () => RotateCard(topItem) },
          { text: 'flip', fn: () => FlipCard(topItem) },
          ...GetRules(topItem),
        ];
      }
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

      items = [...items, ...GetRules(id)];
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
