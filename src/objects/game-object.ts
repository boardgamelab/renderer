import { SchemaEntry, Component } from '@boardgamelab/components';
import Card from './card/Card.svelte';
import CardHolder from './card-holder/CardHolder.svelte';

export function GetComponent(schema: SchemaEntry) {
  switch (schema.type) {
    case Component.CARD:
      return Card;
    case Component.CARD_HOLDER:
      return CardHolder;
    default:
      throw new Error(`Unknown type: ${schema}`);
  }
}
