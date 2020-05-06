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

import { ToSVGPoint } from '../utils/svg';

export interface DragEvent {
  snapshot: any;
  dx: number;
  dy: number;
}

interface DragOpts {
  svg: { el: SVGGraphicsElement };
  snapshot: any;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Svelte directive that allows elements to be dragged.
 */
export function drag(node: Element, opts: DragOpts) {
  let anchor: Point | null = null;
  let snapshot: any = null;

  function Drag(e: MouseEvent | Touch) {
    const point = ToSVGPoint(e as MouseEvent, opts.svg.el);
    const dx = point.x - anchor!.x;
    const dy = point.y - anchor!.y;

    node.dispatchEvent(
      new CustomEvent('drag', { detail: { snapshot, dx, dy } })
    );
  }

  function MouseMove(e: Event) {
    Drag(e as MouseEvent);
  }

  function TouchMove(e: Event) {
    const touchEvent = e as TouchEvent;
    e.preventDefault();
    Drag(touchEvent.touches[0]);
  }

  function Cancel() {
    anchor = null;
    snapshot = null;
    node.dispatchEvent(new CustomEvent('dragend'));
    window.removeEventListener('mousemove', MouseMove);
    window.removeEventListener('touchmove', TouchMove);
    window.removeEventListener('mouseup', Cancel);
    window.removeEventListener('touchend', Cancel);
    window.removeEventListener('touchcancel', Cancel);
    window.removeEventListener('touchleave', Cancel);
  }

  function MouseDown(e: Event) {
    const mouseEvent = e as MouseEvent;

    // Ignore right click.
    if (mouseEvent.button !== 0) {
      return;
    }

    anchor = ToSVGPoint(mouseEvent, opts.svg.el);
    snapshot = opts.snapshot;
    node.dispatchEvent(new CustomEvent('dragstart'));
    window.addEventListener('mousemove', MouseMove);
    window.addEventListener('mouseup', Cancel);
  }

  function TouchStart(e: Event) {
    const touchEvent = e as TouchEvent;

    anchor = ToSVGPoint(touchEvent.touches[0], opts.svg.el);
    snapshot = opts.snapshot;
    window.addEventListener('touchmove', TouchMove, { passive: false });
    window.addEventListener('touchend', Cancel);
    window.addEventListener('touchcancel', Cancel);
    window.addEventListener('touchleave', Cancel);
  }

  node.addEventListener('touchstart', TouchStart);
  node.addEventListener('mousedown', MouseDown);

  return {
    destroy() {
      if (anchor) {
        Cancel();
      }
      node.removeEventListener('mousedown', MouseDown);
      node.removeEventListener('touchstart', TouchStart);
    },

    update(newOpts: DragOpts) {
      opts = newOpts;
    },
  };
}