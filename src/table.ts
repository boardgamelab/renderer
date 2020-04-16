import {
  Schema,
  State,
  Action,
  ApplyActionsToState,
} from '@boardgamelab/components';
import { writable, derived } from 'svelte/store';
import { setContext } from 'svelte';

interface Point {
  x: number;
  y: number;
}

interface Delta {
  x: number;
  y: number;
}

interface Drag {
  point: Point;
  delta: Delta;
  dragAnchor: Point | null;
}

export function Init(
  schema: Schema,
  state: State,
  ref: { svg: SVGGraphicsElement }
) {
  const drag = writable(null as Drag | null);
  const mouseup = writable(null as MouseEvent | null);
  const activeObjectID = writable(null as string | null);

  // The master state is the state that all clients can see.
  const masterState = writable({ ...state });

  // The local state might have some changes that only make
  // sense locally. For example, a dragged object may continuously
  // update its co-orindates as it is being dragged, but we
  // only update the master state at the end of the drag in
  // order to not make the network traffic too chatty.
  const localState = writable({ ...state });

  masterState.subscribe((s) => {
    localState.set(s);
  });

  setContext('mouse', {
    drag,
    mouseup,
    activeObjectID,
  });

  const dispatchAction = (action: Action) => {
    // TODO: We update the state store locally here,
    // but this should probably live outside this component.
    masterState.update((s) => ApplyActionsToState(s, [action]));
  };

  const dispatchEvent = () => {};

  setContext('context', {
    state: localState,
    schema,
    dispatchEvent,
    dispatchAction,
    svg: ref.svg,
  });

  // Raise active object.
  activeObjectID.subscribe((id: string | null) => {
    if (id) {
      const action: Action = {
        kind: 'raise',
        id,
      };
      localState.update((s) => ApplyActionsToState(s, [action]));
    }
  });

  let dragAnchor: Point | null = null;

  /**
   * Sets an anchor point so that a subsequent
   * mousemove can compute a delta for the drag event.
   */
  function MouseDown(e: MouseEvent) {
    // Ignore right-clicks for now.
    if (e.button !== 0) {
      return;
    }

    const ctm = ref.svg.getScreenCTM() || {
      a: 1,
      d: 1,
      e: 0,
      f: 0,
    };
    dragAnchor = {
      x: (e.clientX - ctm.e) / ctm.a,
      y: (e.clientY - ctm.f) / ctm.d,
    };
  }

  /**
   * Compute a delta from the latest mousedown event.
   * Subscribers then decide if they want to drag elements.
   */
  function MouseMove(e: MouseEvent) {
    if (dragAnchor === null) {
      return;
    }

    const ctm = ref.svg.getScreenCTM() || {
      a: 1,
      d: 1,
      e: 0,
      f: 0,
    };
    const x = (e.clientX - ctm.e) / ctm.a;
    const y = (e.clientY - ctm.f) / ctm.d;
    const dx = x - dragAnchor.x;
    const dy = y - dragAnchor.y;

    drag.set({
      point: { x, y },
      dragAnchor,
      delta: { x: dx, y: dy },
    });
  }

  /**
   * Reset the drag anchor.
   */
  function MouseUp(e: MouseEvent) {
    dragAnchor = null;
    mouseup.set(e);
  }

  return {
    mousemove: MouseMove,
    mousedown: MouseDown,
    mouseup: MouseUp,
    renderingOrder: derived(localState, ($s) => ComputeRenderingOrder($s)),
    activeObjectID,
  };
}

/**
 * Orders the state objects by the `order` field.
 * Higher numbers mean that the object will appear later
 * in the returned array.
 */
function ComputeRenderingOrder(s: State): string[] {
  return Object.keys(s.objects).sort((a, b) => {
    const aOrder = s.objects[a].order || 0;
    const bOrder = s.objects[b].order || 0;
    return aOrder < bOrder ? -1 : 1;
  });
}
