import { Schema, State } from '@boardgamelab/components';

export function GetTemplate(schema: Schema, state: State, id: string) {
  let template = state.objects[id].template;

  if (!template) {
    const { templateID } = schema.objects[id];
    template = schema.templates[templateID];
  }

  return template;
}

