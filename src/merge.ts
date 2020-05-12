import { Schema, State } from '@boardgamelab/components';

export function MergeOpts(schema: Schema, state: State, id: string) {
  let opts: any = {};

  if (id in schema.objects) {
    opts = schema.objects[id].opts;
  }

  return { ...opts, ...state.objects[id].opts } || {};
}
