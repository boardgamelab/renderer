<script>
  import { getContext } from 'svelte';

  import RuleIcon from "../list/RuleIcon.svelte";
  import List from '../list/List.svelte';
  import { Component } from '@boardgamelab/components';
  import { GetComponent } from '../../../utils/template.ts';
  import shortid from 'shortid';
  const schema = getContext('schema');
  const seatID = getContext('seatID');
  const viewOnly = getContext('viewOnly');
  const { state, dispatchActions, activeObjects } = getContext('context');

  function Group() {
    dispatchActions([{
      type: 'group',
      context: { seatID },
      schema: $schema,
      ids: Object.keys($activeObjects)
    }]);
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

  function RotateCard(id, component) {
    let delta = 45;

    if (component.layout.geometry.shape === "hex") {
      delta = 30;
    }

    dispatchActions([
      {
        context: { seatID, subject: { id } },
        type: 'tile',
        rotate: { delta },
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
        ruleID: rule.id,
      },
    ]);
  }

  let items = [];

  function GetRules(id) {
    const template = GetComponent($schema, $state, id);
    let items = [];

    if (template) {
      let rules = template.rules;

      template.deps.forEach(dep => {
        const trait = $schema.traits[dep];
        if (trait.rules) {
          rules = [...rules, ...trait.rules];
        }
      });

      if (rules) {
        rules.map(rule => $schema.automation.rules[rule])
             .forEach((rule) => {
               items.push({
                 text: rule.name,
                 fn: () => Rule(rule, id),
                 color: '#93c3ec',
                 icon: RuleIcon,
               });
             });
      }
    }

    return items;
  }

  function UpdateActiveObjectMenu(activeObjects) {
    items = [];

    if (Object.keys(activeObjects).length === 1) {
      const id = Object.keys(activeObjects)[0];
      const obj = $state.objects[id];
      const template = GetComponent($schema, $state, id);

      if (obj && obj.kind && (obj.kind.snap || obj.kind === "stack")) {
        items = [
          { text: 'shuffle', fn: () => Shuffle(id) },
          { text: 'flip', fn: () => FlipDeck(id) },
        ];
      }

      if (template && (template.type === Component.CARD || template.type === Component.TILE)) {
        items = [
          { text: 'rotate', fn: () => RotateCard(id, template) },
          { text: 'flip', fn: () => FlipCard(id) },
        ];
      }

      items = [...items, ...GetRules(id)];
    }

    if (Object.keys(activeObjects).length > 1) {
      items = [{ text: 'group', fn: Group }];
    }
  }

  $: {
    UpdateActiveObjectMenu($activeObjects);
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
