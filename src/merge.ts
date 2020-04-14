import { Schema, State } from '@boardgamelab/components';

export function MergeOpts(schema: Schema, state: State, id: string) {
  return { ...schema.objects[id].opts, ...state.objects[id].opts } || {};
}
