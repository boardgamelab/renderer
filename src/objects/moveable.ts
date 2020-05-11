import { Schema, State } from '@boardgamelab/components';
import { IsOverlap } from '../geometry';

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

    // Don't try to drop on objects that are currently
    // in other containers.
    if (obj.parent) {
      continue;
    }

    const { templateID } = schema.objects[id];
    const { geometry } = schema.templates[templateID];

    const dropBox: any = {
      x: obj.opts?.x || 0,
      y: obj.opts?.y || 0,
      width: geometry.width,
      height: geometry.height,
    };

    if (IsOverlap(boundingBox, dropBox)) {
      let originalParent = false;
      if (state.objects[draggedObjectID].parent === id) {
        originalParent = true;
      }
      return { ...dropBox, originalParent, id };
    }
  }

  return null;
}
