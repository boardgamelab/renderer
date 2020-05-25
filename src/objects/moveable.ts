import { Component, Schema, State } from '@boardgamelab/components';
import type { Writable } from 'svelte/store';
import { IsOverlap } from '../geometry';
import { GetTemplate } from '../utils/template';
import shortid from 'shortid';

interface DropInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  targetID: string;
  targetType: Component;
  targetIsCurrentParent: boolean;
}

export function Drop(
  id: string,
  drop: DropInfo | null,
  absolutePosition: any,
  dispatchActions: any,
  activeObjects: Writable<object>
) {
  if (drop) {
    if (drop.targetIsCurrentParent) {
      return;
    }

    if (drop.targetType === Component.CARD) {
      DropInNewDeck(dispatchActions, drop, id, activeObjects);
    } else {
      activeObjects.set({
        [drop.targetID]: true,
      });
      dispatchActions([
        {
          kind: 'add-to',
          id,
          parent: drop.targetID,
        },
      ]);
    }
  } else {
    DropOnTable(dispatchActions, id, absolutePosition);
  }
}

function DropOnTable(dispatchActions: any, id: string, absolutePosition: any) {
  dispatchActions([
    {
      kind: 'position',
      id,
      x: absolutePosition.x,
      y: absolutePosition.y,
    },
    {
      kind: 'add-to',
      id,
      parent: null,
    },
  ]);
}

function DropInNewDeck(
  dispatchActions: any,
  drop: DropInfo,
  id: string,
  activeObjects: Writable<object>
) {
  const newID = shortid();

  activeObjects.set({
    [newID]: true,
  });

  dispatchActions([
    // Create a new ephemeral deck.
    {
      kind: 'create',
      id: newID,
      template: {
        type: Component.DECK,
        id: newID,
        geometry: {
          width: drop.width,
          height: drop.height,
        },
      },
    },
    // Position deck over card.
    {
      kind: 'position',
      id: newID,
      x: drop.x,
      y: drop.y,
    },
    // Add drop target to new deck.
    {
      kind: 'add-to',
      id: drop.targetID,
      parent: newID,
    },
    // Add dragged card to new deck.
    {
      kind: 'add-to',
      id,
      parent: newID,
    },
  ]);
}

export function CheckForDrop(
  state: State,
  schema: Schema,
  rawPosition: any,
  draggedObjectID: string,
  hand: { el: HTMLElement },
  toSVGPoint: Function
): DropInfo | null {
  const template = GetTemplate(schema, state, draggedObjectID);
  if (!template) {
    return null;
  }

  const { geometry } = template;

  const boundingBox: any = {
    x: rawPosition.x,
    y: rawPosition.y,
    width: geometry.width,
    height: geometry.height,
  };

  // Check if we should drop on the player hand.
  const rect = hand!.el.getBoundingClientRect();
  const handPosition = toSVGPoint({
    x: rect.left + rect.width / 2,
    y: rect.top,
  });
  if (rawPosition.y + geometry.height > handPosition.y) {
    return {
      x: handPosition.x,
      y: handPosition.y,
      width: rect.width,
      height: rect.height,
      targetType: Component.HAND,
      targetIsCurrentParent: false,
      targetID: 'hand',
    };
  }

  for (let id in state.objects) {
    if (id === draggedObjectID) {
      continue;
    }

    const obj = state.objects[id];

    // Don't try to drop on objects that are currently
    // in other containers.
    if (obj.parent) {
      continue;
    }

    const template = GetTemplate(schema, state, id);
    if (!template) {
      continue;
    }

    // Don't try to drop on player hand.
    if (template.type === Component.HAND) {
      continue;
    }

    const { geometry } = template;
    const dropBox: any = {
      x: obj.x || 0,
      y: obj.y || 0,
      width: geometry.width,
      height: geometry.height,
    };

    if (IsOverlap(boundingBox, dropBox)) {
      let targetIsCurrentParent = false;
      if (state.objects[draggedObjectID].parent === id) {
        targetIsCurrentParent = true;
      }
      return {
        ...dropBox,
        targetType: template.type,
        targetIsCurrentParent,
        targetID: id,
      };
    }
  }

  return null;
}
