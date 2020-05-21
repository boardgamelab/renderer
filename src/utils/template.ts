import { Schema, State } from '@boardgamelab/components';

export function GetTemplate(schema: Schema, state: State, id: string) {
  let template = null;

  if (id in state.objects) {
    const t = state.objects[id].template;
    if (t) template = t;
  }

  if (!template && id in schema.objects) {
    const { templateID } = schema.objects[id];
    const t = schema.templates[templateID];
    if (t) template = t;
  }

  return template;
}

