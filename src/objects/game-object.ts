import { State, Schema, Component } from '@boardgamelab/components';
import Deck from './deck/Deck.svelte';
import Card from './card/Card.svelte';
import CardHolder from './card-holder/CardHolder.svelte';

export function GetComponent(schema: Schema, state: State, id: string) {
  if (!(id in state.objects)) {
    return null;
  }

  const entry = state.objects[id];

  // The object itself might carry a template.
  // This is the case for ephemeral decks.
  let template = entry.template;

  // If not, locate it in the schema.
  if (!template) {
    if (!(id in schema.objects)) {
      return null;
    }

    const templateID = schema.objects[id].templateID;
    template = schema.templates[templateID];
  }

  switch (template.type) {
    case Component.CARD:
      return Card;
    case Component.DECK:
      return Deck;
    case Component.CARD_HOLDER:
      return CardHolder;
    case Component.HAND:
      return null;
    default:
      throw new Error(`Invalid template: ${template}`);
  }
}
