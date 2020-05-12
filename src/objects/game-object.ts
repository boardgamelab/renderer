import { State, Schema, Component } from '@boardgamelab/components';
import Deck from './deck/Deck.svelte';
import Card from './card/Card.svelte';
import CardHolder from './card-holder/CardHolder.svelte';

export function GetComponent(schema: Schema, state: State, id: string) {
  const entry = state.objects[id];

  // The object itself might carry a template.
  // This is the case for ephemeral decks.
  let template = entry.template;

  // If not, locate it in the schema.
  if (!template) {
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
    default:
      throw new Error(`Invalid template: ${template}`);
  }
}
