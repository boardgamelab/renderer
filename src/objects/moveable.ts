import type { Writable } from 'svelte/store';

interface DropInfo {
  targetID: string;
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

    activeObjects.set({
      [drop.targetID]: true,
    });
    dispatchActions([
      {
        type: 'add-to',
        subject: { id },
        dest: { id: drop.targetID },
      },
    ]);
  } else {
    DropOnTable(dispatchActions, id, absolutePosition);
  }
}

function DropOnTable(dispatchActions: any, id: string, absolutePosition: any) {
  dispatchActions([
    {
      type: 'add-to',
      subject: { id },
      dest: null,
    },
    {
      type: 'position',
      subject: { id },
      x: absolutePosition.x,
      y: absolutePosition.y,
    },
  ]);
}
