import { State, Schema } from '@boardgamelab/components';
import { GetTemplate } from '../utils/template';

export interface GameObject {
  id: string;
  stateVal: object;
  schemaVal: object;
  template: object | null;
  children: GameObject[];
}

/**
 * Retrieves data associated with a game object from an ID.
 */
export function GetGameObject(
  schema: Schema,
  state: State,
  id: string
): GameObject {
  const stateVal = state.objects[id];
  const template = GetTemplate(schema, state, id);

  const childrenID: string[] = (stateVal as any).children || [];
  const children: GameObject[] = childrenID.map((childID) =>
    GetGameObject(schema, state, childID)
  );

  return {
    id,
    stateVal: state.objects[id],
    schemaVal: schema.objects[id],
    template,
    children,
  };
}
