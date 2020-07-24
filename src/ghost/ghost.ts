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

import { DragEvent } from '../gestures/drag';

interface Opts {
  api: Ghost;
  parentID: string | null;
}

interface Ghost {
  show: (s: string) => void;
  revert: () => Promise<void>;
  hide: () => void;
  setID: (id?: string) => void;
  setPosition: (x: number, y: number) => void;
  move: (dx: number, dy: number) => void;
}

type Detail = { detail: DragEvent };

export function ghost(node: Element, opts: Opts) {
  function MoveStart({ detail }: Detail) {
    const rect = detail.target.getBoundingClientRect();
    opts.api.setPosition(Math.round(rect.x), Math.round(rect.y));
    opts.api.setID((detail.target as HTMLElement)?.dataset.id);
    opts.api.show(detail.target.outerHTML);
  }

  function Move({ detail }: Detail) {
    opts.api.move(detail.client.dx, detail.client.dy);
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

    opts.api.hide();
  }

  // @ts-ignore
  node.addEventListener('movestart', MoveStart);
  // @ts-ignore
  node.addEventListener('move', Move);
  // @ts-ignore
  node.addEventListener('moveend', MoveEnd);

  return {
    destroy() {
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
