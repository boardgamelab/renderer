import type { State, Schema } from '@boardgamelab/components';
import { GetComponent } from '../utils/template';

export interface GameObject {
  id: string;
  stateVal: object;
  instance: object;
  component: object | null;
  children: GameObject[];
  snapZones: GameObject[];
}

/**
 * Retrieves data associated with a game object from an ID.
 */
export function GetGameObject(
  schema: Schema,
  state: State,
  id: string
): GameObject|null {
  const stateVal = state.objects[id];

  if (!stateVal) {
    return null;
  }

  const instanceID = stateVal.instance || "";
  const component = GetComponent(schema, state, id);

  const childrenID: string[] = (stateVal as any).children || [];
  const children = childrenID.map((childID) =>
    GetGameObject(schema, state, childID)
  ) as GameObject[];

  const snapZoneIDs = GetSnapZoneIDs(component, id);
  const snapZones = snapZoneIDs.map((id) =>
    GetGameObject(schema, state, id)
  ).filter(obj => obj) as GameObject[];

  return {
    id,
    stateVal: state.objects[id],
    instance: schema.instances[instanceID],
    component,
    children,
    snapZones,
  };
}

function GetSnapZoneIDs(component: any, instanceID: string): string[] {
  const snaps = component?.layout?.faces.flatMap((face: any) => face.layers).flatMap((layer: any) => Object.values(layer.parts)).filter((part: any) => part.snap);

  if (!snaps) {
    return [];
  }

  return snaps.map((snap: any) => `${snap.id}:${instanceID}`);
}
