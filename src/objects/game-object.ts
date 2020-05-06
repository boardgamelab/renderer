import {
  GameObject,
  Schema,
  Component,
  State,
  StateEntry,
} from '@boardgamelab/components';
import { IsOverlap } from '../geometry';
import Deck from './deck/Deck.svelte';
import Card from './card/Card.svelte';
import CardHolder from './card-holder/CardHolder.svelte';

export function GetComponent(
  schema: Schema,
  entry: GameObject.Entry,
  state: StateEntry
) {
  if (state.opts?.isEphemeralDeck) {
    return Deck;
  }

  switch (schema.templates?.[entry.templateID]?.type) {
    case Component.CARD:
      return Card;
    case Component.CARD_HOLDER:
      return CardHolder;
    default:
      throw new Error(`Cannot find templateID: ${entry.templateID}`);
  }
}

export function CheckForDrop(
  state: State,
  schema: Schema,
  rawPosition: any,
  draggedObjectID: string
) {
  const { templateID } = schema.objects[draggedObjectID];
  const { geometry } = schema.templates[templateID];

  const boundingBox: any = {
    x: rawPosition.x,
    y: rawPosition.y,
    width: geometry.width,
    height: geometry.height,
  };

  for (let id in state.objects) {
    if (id === draggedObjectID) {
      continue;
    }

    const obj = state.objects[id];
    const { templateID } = schema.objects[id];
    const { geometry } = schema.templates[templateID];

    const dropBox: any = {
      x: obj.opts?.x || 0,
      y: obj.opts?.y || 0,
      width: geometry.width,
      height: geometry.height,
    };

    if (IsOverlap(boundingBox, dropBox)) {
      return { ...dropBox, id };
    }
  }

  return null;
}
