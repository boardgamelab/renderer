import { State, Schema, Action } from '@boardgamelab/components';
import type { createEventDispatcher } from 'svelte';
import type { Readable } from 'svelte/store';
import { writable, derived, get } from 'svelte/store';
import { setContext, onDestroy } from 'svelte';
import { GetGameObject, GameObject } from './objects/game-object';

export function Init(
  schema: Readable<Schema>,
  masterState: Readable<State>,
  svg: { el: SVGGraphicsElement },
  dispatch: ReturnType<typeof createEventDispatcher>
) {
  const activeObjects = writable({});

  // The local state might have some changes that only make
  // sense locally. For example, a dragged object may continuously
  // update its co-ordinates as it is being dragged, but we
  // only update the master state at the end of the drag in
  // order to not make the network traffic too chatty.
  const localState = writable({ ...get(masterState) });

  const u1 = masterState.subscribe((s) => {
    // TODO: Should we update the state in a loop here
    // so that individual actions can be animated?
    // Consider playing animations *before* a state
    // update rather than after. The advantage is that
    // you don't need to keep track of previous_positions.
    // Just apply the action, animate the element to the
    // next position and then commit the new state. This
    // also allows animations for cases where the element
    // becomes hidden somewhere. The only case that is not
    // handled is when an element is added to the table
    // from a hand (say). For this, maybe animate from the
    // div element in the hand?
    // Maybe use ghosts everywhere so that you don't have
    // to worry about elements being present?
    localState.set(s);
  });

  const objects = derived([schema, localState], ([$schema, $s]) => {
    return ComputeRenderingOrder($schema, $s);
  });

  onDestroy(() => {
    u1();
  });

  const dispatchActions = (actions: Action[]) => {
    dispatch('action', { actions });
  };

  const dispatchEvent = () => {};

  // ID's of objects that should be highlighted.
  const highlight = writable({});

  setContext('highlight', highlight);
  setContext('state', localState);

  setContext('context', {
    state: localState,
    dispatchEvent,
    dispatchActions,
    activeObjects,
    svg,
  });

  return {
    stateStore: localState,
    objects,
    activeObjects,
    dispatchActions,
  };
}

/**
 * Orders the state objects by the `order` field.
 * Higher numbers mean that the object will appear later
 * in the returned array.
 */
function ComputeRenderingOrder(schema: Schema, s: State): GameObject[] {
  return Object.keys(s.objects)
    .filter((key) => {
      return !s.objects[key].parent;
    })
    .sort((a, b) => {
      const aOrder = s.objects[a].order || 0;
      const bOrder = s.objects[b].order || 0;
      return aOrder < bOrder ? -1 : 1;
    })
    .map((id) => GetGameObject(schema, s, id))
    .filter((obj) => obj && obj.template);
}
