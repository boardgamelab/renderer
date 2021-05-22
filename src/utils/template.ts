import type { Schema, State } from '@boardgamelab/components';

export function GetComponent(schema: Schema, state: State, id: string) {
  // Check if template is in the state itself (true for decks).
  if (id in state.objects) {
    const t = state.objects[id].template;
    if (t) return t;
  }

  // Check if object exists in schema.
  if (id in schema.instances) {
    const { componentID } = schema.instances[id];
    const t = schema.components[componentID];
    if (t) return t;
  }

  // Check if object is a copy of an instance in the schema.
  const trimmed = GetTrimmed(id);
  if (trimmed && trimmed in schema.instances) {
    const { componentID } = schema.instances[trimmed];
    const t = schema.components[componentID];
    if (t) return t;
  }

  return null;
}

/**
 * Return the ID with the -<copy number> suffix removed.
 */
function GetTrimmed(id: string): string | null {
  const m = id.match(/(.*)-\d+/);
  if (!m) return null;
  return m[1];
}
