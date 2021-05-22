import type { State, Schema } from '@boardgamelab/components';
import { GetComponent } from '../utils/template';

export interface GameObject {
  id: string;
  stateVal: object;
  instance: object;
  component: object | null;
  children: GameObject[];
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
  const schemaID = GetTrimmed(id);
  const component = GetComponent(schema, state, id);

  const childrenID: string[] = (stateVal as any).children || [];
  const children = childrenID.map((childID) =>
    GetGameObject(schema, state, childID)
  ) as GameObject[];

  if (component) {
    return {
      id,
      stateVal: state.objects[id],
      instance: schema.instances[schemaID],
      component,
      children,
    };
  }

  return null;
}

/**
 * Return the ID with the -<copy number> suffix removed.
 */
function GetTrimmed(id: string): string {
  const m = id.match(/(.*)-\d+/);
  if (!m) return id;
  return m[1];
}
