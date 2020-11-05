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
      type: 'object',
      context: { subject: { id } },
      position: {
        x: absolutePosition.x,
        y: absolutePosition.y,
      },
    },
  ]);
}
