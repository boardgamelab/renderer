/*
 * Copyright 2020 Nicolo John Davis
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import type { DragEvent } from '../gestures/drag';
import { senders } from "../utils/crossfade";
import Ghost from "./Ghost.svelte";
import type { SvelteComponent } from "svelte";
import type { Writable } from "svelte/store";

interface Opts {
  id: string;
  onTable?: boolean;
  disable?: boolean;
  parentID: string | null;
  highlight: Writable<any>;
  activeObjects: Writable<any>;
  dispatchActions: Function;
  isSnap?: boolean;
}

type Detail = { detail: DragEvent };
type Point = { x: number, y: number };

export function ghost(node: Element, opts: Opts) {
  let ghost: SvelteComponent|null = null;
  let originalPosition: Point|null = null;
  let dragged = false;

  function MoveStart({ detail }: Detail) {
    if (opts.disable) {
      return;
    }

    dragged = false;

    const rect = detail.target.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    let viewBox;
    if (opts.onTable) {
      const bbox = (detail.target as SVGGraphicsElement).getBBox();
      viewBox = opts.onTable
        ? `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
        : '';
    }

    const content = opts.onTable ? detail.target.innerHTML : detail.target.outerHTML;
    const position = { x: rect.x, y: rect.y };

    originalPosition = position;

    ghost = new Ghost({
      target: document.body,
      props: {
        width,
        height,
        viewBox,
        position,
        content
      }
    });

    node.dispatchEvent(new CustomEvent("hide"));
  }

  function Move({ detail }: Detail) {
    dragged = true;

    const position = {
      x: originalPosition!.x + detail.client.dx,
      y: originalPosition!.y + detail.client.dy,
    };

    ghost!.$set({ position });

    let h = {};
    if (detail.dropID && detail.dropID !== opts.parentID) {
      h = {
        [detail.dropID]: true,
      };
    }
    opts.highlight.set(h);

    opts.activeObjects.set({
      [opts.id]: true,
    });
  }

  function MoveEnd({ detail }: Detail) {
    const el = document.getElementById("ghost");
    senders.set(opts.id, {
      rect: el!.getBoundingClientRect(),
      ghost: true,
    });

    // Clean up map entry after any transition has played.
    setTimeout(() => {
      senders.delete(opts.id);
    }, 50);

    ghost!.$destroy();

    ghost = null;
    originalPosition = null;

    opts.highlight.set({});

    // If the object switches containers, we don't
    // have to restore visibility because the object will be created
    // anew at the new destination. If we did restore visibility in
    // those cases, there will be a slight flickering artifact as the
    // object becomes visible right before it disappears again as it
    // is destroyed.
    if (detail.dropID === opts.parentID) {
      node.dispatchEvent(new CustomEvent("show"));
    }

    if (opts.isSnap) {
      setTimeout(() => {
        node.dispatchEvent(new CustomEvent("show"));
      }, 10);
    }

    if (!dragged) {
      return;
    }

    let drop = null;

    if (detail.dropID) {
      drop = {
        targetID: detail.dropID,
      };

    //   const target = $state.objects[detail.dropID];
    //   if (target) {
    //     if (target.t === 'tile') {
    //       activeObjects.set({
    //         ['deck-' + detail.dropID]: true,
    //       });
    //     }
    //     if (target.t === 'container') {
    //       activeObjects.set({
    //         [detail.dropID]: true,
    //       });
    //     }
    //   }
    }

    const absolutePosition = { x: detail.svg.targetX, y: detail.svg.targetY };
    Drop(opts.id, drop, absolutePosition, opts.dispatchActions, node);
  }

  // @ts-ignore
  node.addEventListener('movestart', MoveStart);
  // @ts-ignore
  node.addEventListener('move', Move);
  // @ts-ignore
  node.addEventListener('moveend', MoveEnd);

  return {
    destroy() {
      if (ghost) {
        ghost!.$destroy();
      }

      // @ts-ignore
      node.removeEventListener('movestart', MoveStart);
      // @ts-ignore
      node.removeEventListener('move', Move);
      // @ts-ignore
      node.removeEventListener('moveend', MoveEnd);
    },

    update(newOpts: Opts) {
      opts = newOpts;
    },
  };
}

interface DropInfo {
  targetID: string;
}

export function Drop(
  id: string,
  drop: DropInfo | null,
  position: any,
  dispatchActions: any,
  node: Element
) {
  if (drop) {
    dispatchActions([
      {
        type: 'object',
        context: { subject: { id }, args: [{ object: drop.targetID }] },
        move: {},
      },
    ]);
  } else {
    DropOnTable(dispatchActions, id, position);
    node.dispatchEvent(new CustomEvent("table", { detail: { position }}));
  }
}

function DropOnTable(dispatchActions: any, id: string, position: any) {
  dispatchActions([
    {
      type: 'object',
      context: { subject: { id } },
      move: {
        position,
      },
    },
  ]);
}
