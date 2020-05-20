import { Schema, State, Action } from '@boardgamelab/components';
import type { createEventDispatcher } from 'svelte';
import type { Readable } from 'svelte/store';
import { writable, derived, get } from 'svelte/store';
import { setContext } from 'svelte';

export function Init(
  schema: Schema,
  masterState: Readable<State>,
  svg: { el: SVGGraphicsElement },
  hand: { el: HTMLElement },
  dispatch: ReturnType<typeof createEventDispatcher>
) {
  const activeObjects = writable({});

  // The local state might have some changes that only make
  // sense locally. For example, a dragged object may continuously
  // update its co-orindates as it is being dragged, but we
  // only update the master state at the end of the drag in
  // order to not make the network traffic too chatty.
  const localState = writable({ ...get(masterState) });

  masterState.subscribe((s) => {
    localState.set(s);
  });

  const dispatchActions = (actions: Action[]) => {
    console.log(actions);
    dispatch('action', { actions });
  };

  const dispatchEvent = () => {};

  // ID's of objects that should be highlighted.
  const highlight = writable({});
  setContext('highlight', highlight);

  setContext('context', {
    state: localState,
    schema,
    dispatchEvent,
    dispatchActions,
    activeObjects,
    svg,
    hand,
  });

  return {
    stateStore: localState,
    renderingOrder: derived(localState, ($s) => ComputeRenderingOrder($s)),
    activeObjects,
    dispatchActions,
  };
}

/**
 * Orders the state objects by the `order` field.
 * Higher numbers mean that the object will appear later
 * in the returned array.
 */
function ComputeRenderingOrder(s: State): string[] {
  return Object.keys(s.objects)
    .filter((key) => {
      return !s.objects[key].parent;
    })
    .sort((a, b) => {
      const aOrder = s.objects[a].order || 0;
      const bOrder = s.objects[b].order || 0;
      return aOrder < bOrder ? -1 : 1;
    });
}
