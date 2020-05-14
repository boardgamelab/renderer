import { Component, Schema, State } from '@boardgamelab/components';
import type { Writable } from 'svelte/store';
import { IsOverlap } from '../geometry';
import shortid from 'shortid';

function GetTemplate(schema: Schema, state: State, id: string) {
  let template = state.objects[id].template;

  if (!template) {
    const { templateID } = schema.objects[id];
    template = schema.templates[templateID];
  }

  return template;
}

interface DropInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  targetID: string;
  targetType: Component;
  targetIsCurrentParent: boolean;
}

export async function Drop(
  id: string,
  drop: DropInfo | null,
  absolutePosition: any,
  dropRelativeToParent: any,
  position: any,
  dispatchActions: any,
  activeObjects: Writable<object>
) {
  if (drop) {
    await position.set(
      {
        x: dropRelativeToParent.x,
        y: dropRelativeToParent.y,
      },
      { duration: 150 }
    );

    dispatchActions([
      {
        kind: 'opts',
        id,
        key: 'x',
        value: 0,
      },
      {
        kind: 'opts',
        id,
        key: 'y',
        value: 0,
      },
    ]);

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
      kind: 'opts',
      id,
      key: 'x',
      value: absolutePosition.x,
    },
    {
      kind: 'opts',
      id,
      key: 'y',
      value: absolutePosition.y,
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
      kind: 'opts',
      id: newID,
      key: 'x',
      value: drop.x,
    },
    {
      kind: 'opts',
      id: newID,
      key: 'y',
      value: drop.y,
    },
    {
      kind: 'opts',
      id: drop.targetID,
      key: 'x',
      value: 0,
    },
    {
      kind: 'opts',
      id: drop.targetID,
      key: 'y',
      value: 0,
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
  draggedObjectID: string
): DropInfo | null {
  const template = GetTemplate(schema, state, draggedObjectID);
  const { geometry } = template;

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

    // Don't try to drop on objects that are currently
    // in other containers.
    if (obj.parent) {
      continue;
    }

    const template = GetTemplate(schema, state, id);
    const { geometry } = template;
    const dropBox: any = {
      x: obj.opts?.x || 0,
      y: obj.opts?.y || 0,
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
