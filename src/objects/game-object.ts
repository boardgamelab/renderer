import { GameObject, Schema, Component } from '@boardgamelab/components';
import Card from './card/Card.svelte';
import CardHolder from './card-holder/CardHolder.svelte';

export function GetComponent(schema: Schema, entry: GameObject.Entry) {
  switch (schema.templates?.[entry.templateID]?.type) {
    case Component.CARD:
      return Card;
    case Component.CARD_HOLDER:
      return CardHolder;
    default:
      throw new Error(`Cannot find templateID: ${entry.templateID}`);
  }
}
