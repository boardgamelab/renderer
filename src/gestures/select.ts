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

import type { Writable } from 'svelte/store';
import { ToSVGPoint } from '../utils/svg';
import { FindIntersectingObjects } from '../geometry';
import { Schema, State } from '@boardgamelab/components';

interface Opts {
  activeObjects: Writable<object>;
  selectBox: Writable<object | null>;
  panX: number;
  panY: number;
  schema: Schema;
  state: State;
  svg: { el: SVGGraphicsElement };
}

interface Point {
  x: number;
  y: number;
}

/**
 * Svelte directive that allows elements to be selected.
 */
export function select(node: HTMLElement, opts: Opts) {
  let o = opts;
  let selectBoxAnchor: Point | null = null;
  let selectBox = false;

  function TouchDrag(e: TouchEvent) {
    if (e.touches.length === 1) {
      Drag(e.touches[0]);
    }
  }

  function Drag(e: MouseEvent | Touch) {
    const point = ToSVGPoint(e as MouseEvent, opts.svg.el);

    selectBox = true;

    const x1 = Math.min(selectBoxAnchor!.x, point.x);
    const x2 = Math.max(selectBoxAnchor!.x, point.x);
    const y1 = Math.min(selectBoxAnchor!.y, point.y);
    const y2 = Math.max(selectBoxAnchor!.y, point.y);

    const box = {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
    };

    o.selectBox.set(box);

    // Adjust the box for the current pan offset.
    const translatedBox = {
      ...box,
      x: box.x - o.panX,
      y: box.y - o.panY,
    };

    const selectedObjects = FindIntersectingObjects(
      translatedBox,
      o.schema,
      o.state
    );

    let selected: any = {};
    selectedObjects.forEach((id) => {
      selected[id] = true;
    });
    o.activeObjects.set(selected);
  }

  function MouseDown(e: MouseEvent) {
    if (e.button !== 0) {
      return;
    }

    const target = (e.target as Element).closest('[data-selectable=true]');

    if (target) {
      target.dispatchEvent(new CustomEvent('select'));
      const id = (target as HTMLElement).dataset.id as string;
      o.activeObjects.set({ [id]: true });
    } else {
      selectBoxAnchor = ToSVGPoint(e as MouseEvent, opts.svg.el);
      window.addEventListener('mousemove', Drag);
      window.addEventListener('mouseup', Cancel);
    }
  }

  function TouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) {
      return;
    }
    const touch = e.touches[0];
    const target = (touch.target as Element).closest('[data-selectable=true]');

    if (target) {
      target.dispatchEvent(new CustomEvent('select'));
      const id = (target as HTMLElement).dataset.id as string;
      o.activeObjects.set({ [id]: true });
    } else {
      selectBoxAnchor = ToSVGPoint(touch, opts.svg.el);
      node.addEventListener('touchmove', TouchDrag);
      node.addEventListener('touchend', Cancel);
      node.addEventListener('touchcancel', Cancel);
      node.addEventListener('touchleave', Cancel);
    }
  }

  function Cancel() {
    // No select box was created and no element was selected.
    // Cancel any existing selection.
    if (!selectBox) {
      o.activeObjects.set({});
    }

    selectBox = false;
    selectBoxAnchor = null;
    o.selectBox.set(null);
    window.removeEventListener('mousemove', Drag);
    window.removeEventListener('mouseup', Cancel);
    node.removeEventListener('touchmove', TouchDrag);
    node.removeEventListener('touchend', Cancel);
    node.removeEventListener('touchcancel', Cancel);
    node.removeEventListener('touchleave', Cancel);
  }

  node.addEventListener('touchstart', TouchStart);
  node.addEventListener('mousedown', MouseDown);

  return {
    destroy() {
      if (selectBoxAnchor) {
        Cancel();
      }
      node.removeEventListener('mousedown', MouseDown);
      node.removeEventListener('touchstart', TouchStart);
    },

    update(opts: Opts) {
      o = opts;
    },
  };
}
