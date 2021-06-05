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

interface Opts {
  id: string;
  onTable?: boolean;
  disable?: boolean;
  parentID: string | null;
}

type Detail = { detail: DragEvent };
type Point = { x: number, y: number };

export function ghost(node: Element, opts: Opts) {
  let ghost: SvelteComponent|null = null;
  let originalPosition: Point|null = null;

  function MoveStart({ detail }: Detail) {
    if (opts.disable) {
      return;
    }

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
  }

  function Move({ detail }: Detail) {
    const position = {
      x: originalPosition!.x + detail.client.dx,
      y: originalPosition!.y + detail.client.dy,
    };

    ghost!.$set({ position });
  }

  function MoveEnd({ detail }: Detail) {
    // If the element is being dropped back into it's
    // original location, then animate it back first.
    // const t = node as HTMLElement;
    // if (detail.dropID === opts.parentID) {
    //   t.style.opacity = '0';
    //   await opts.api.revert();
    //   t.style.opacity = '1';
    // }
    //

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
