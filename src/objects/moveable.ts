interface DropInfo {
  targetID: string;
}

export function Drop(
  id: string,
  drop: DropInfo | null,
  absolutePosition: any,
  dispatchActions: any
) {
  if (drop) {
    dispatchActions([
      {
        type: 'object',
        context: { subject: { id }, args: [{ object: drop.targetID }] },
        move: {},
      },
    ]);
  } else {
    DropOnTable(dispatchActions, id, absolutePosition);
  }
}

function DropOnTable(dispatchActions: any, id: string, absolutePosition: any) {
  dispatchActions([
    {
      type: 'object',
      context: { subject: { id } },
      move: {},
    },
    {
      type: 'object',
      context: { subject: { id } },
      position: {
        x: absolutePosition.x,
        y: absolutePosition.y,
      },
    },
  ]);
}
