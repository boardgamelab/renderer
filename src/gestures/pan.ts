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
import throttle from 'lodash.throttle';

interface Point {
  x: number;
  y: number;
}

declare type Updater<T> = (target_value: T, value: T) => T;
interface Tweened<T> {
  update(updater: Updater<T>, opts?: object): Promise<void>;
}

interface Opts {
  // Top-left X coordinate.
  panX: Tweened<number>;
  // Top-left Y coordinate.
  panY: Tweened<number>;
}

const PAN_DELTA_X = 2000;
const PAN_DELTA_Y = 2000;

/**
 * Svelte directive that allows the viewport to be panned.
 */
export function pan(node: Element, opts: Opts) {
  const KeyDown = throttle(
    (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'ArrowDown') {
        opts.panY.update((v) => v - PAN_DELTA_Y);
      }

      if (e.key === 'w' || e.key === 'ArrowUp') {
        opts.panY.update((v) => v + PAN_DELTA_Y);
      }

      if (e.key === 'a' || e.key === 'ArrowLeft') {
        opts.panX.update((v) => v + PAN_DELTA_X);
      }

      if (e.key === 'd' || e.key === 'ArrowRight') {
        opts.panX.update((v) => v - PAN_DELTA_X);
      }
    },
    200,
    { leading: true }
  );

  let anchor: Point | null = null;

  function Drag(e: MouseEvent | Touch) {
    const point = ToSVGPoint(e, node as SVGGraphicsElement);
    const dx = point.x - anchor!.x;
    const dy = point.y - anchor!.y;
    anchor = point;
    opts.panX.update((v) => v + dx, { duration: 0 });
    opts.panY.update((v) => v + dy, { duration: 0 });
  }

  function MouseMove(e: Event) {
    Drag(e as MouseEvent);
  }

  function TouchMove(e: Event) {
    const touchEvent = e as TouchEvent;
    e.preventDefault();

    if (touchEvent.touches.length === 2) {
      e.stopPropagation();
      Drag(touchEvent.touches[0]);
    }
  }

  function MouseDown(e: Event) {
    const mouseEvent = e as MouseEvent;

    if (mouseEvent.button !== 1) {
      return;
    }

    anchor = ToSVGPoint(mouseEvent, node as SVGGraphicsElement);
    window.addEventListener('mousemove', MouseMove);
    window.addEventListener('mouseup', Cancel);
  }

  function TouchStart(e: Event) {
    const touchEvent = e as TouchEvent;

    if (touchEvent.touches.length === 2) {
      // prevent other gestures like 'select' from being triggered.
      e.stopPropagation();
      e.stopImmediatePropagation();

      anchor = ToSVGPoint(touchEvent.touches[0], node as SVGGraphicsElement);
      node.addEventListener('touchmove', TouchMove);
      node.addEventListener('touchcancel', Cancel);
      node.addEventListener('touchend', Cancel);
      node.addEventListener('touchleave', Cancel);
    }
  }

  function Cancel() {
    node.removeEventListener('touchmove', TouchMove);
    node.removeEventListener('touchcancel', Cancel);
    node.removeEventListener('touchend', Cancel);
    node.removeEventListener('touchleave', Cancel);
    window.removeEventListener('mousemove', MouseMove);
    window.removeEventListener('mouseup', Cancel);
    anchor = null;
  }

  window.addEventListener('keydown', KeyDown);
  node.addEventListener('mousedown', MouseDown);
  node.addEventListener('touchstart', TouchStart);

  return {
    destroy() {
      if (anchor) {
        Cancel();
      }
      window.removeEventListener('keydown', KeyDown);
      node.removeEventListener('mousedown', MouseDown);
      node.removeEventListener('touchstart', TouchStart);
    },

    update(newOpts: Opts) {
      opts = newOpts;
    },
  };
}
