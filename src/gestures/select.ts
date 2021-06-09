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
import type { Schema, State } from '@boardgamelab/components';

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
  let longPressHandle: any = null;

  function TouchMultiSelectDrag(e: TouchEvent) {
    if (e.touches.length === 1) {
      MultiSelectDrag(e.touches[0]);
    }
  }

  function MultiSelectDrag(e: MouseEvent | Touch) {
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

  function LongSelect(target: Element) {
    target.dispatchEvent(new CustomEvent('select'));
    const id = (target as HTMLElement).dataset.id as string;
    o.activeObjects.set({ [id]: true });
  }

  function CheckLongSelect(e: MouseEvent | Touch) {
    const target = (e.target as Element).closest('[data-selectable=long]');

    if (target) {
      target.dispatchEvent(new CustomEvent('select'));
      longPressHandle = setTimeout(() => LongSelect(target), 500);
      return target;
    }

    return null;
  }

  function CheckSelect(e: MouseEvent | Touch) {
    const target = (e.target as Element).closest('[data-selectable=true]');

    if (target) {
      const id = (target as HTMLElement).dataset.id as string;
      o.activeObjects.set({ [id]: true });
      target.dispatchEvent(new CustomEvent('select'));
      return target;
    }

    return null;
  }

  function CheckMultiSelect(e: MouseEvent | Touch) {
    const target = (e.target as Element).closest('[data-selectable=true]');
    return !target;
  }

  function MouseDown(e: MouseEvent) {
    if (e.button !== 0 || e.ctrlKey) {
      return;
    }

    let selected = false;

    if (CheckSelect(e)) {
      e.stopPropagation();
      selected = true;
    }

    if (CheckLongSelect(e)) {
      window.addEventListener('mousemove', CancelLongSelect);
      window.addEventListener('mouseup', CancelLongSelect);
      selected = true;
    }

    if (CheckMultiSelect(e)) {
      window.addEventListener('mousemove', MultiSelectDrag);
      window.addEventListener('mouseup', CancelMultiSelect);

      selectBoxAnchor = ToSVGPoint(e as MouseEvent, opts.svg.el);
      selected = true;
    }

    if (!selected) {
      opts.activeObjects.set({});
    }
  }

  function TouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) {
      return;
    }

    const touch = e.touches[0];

    let selected = false;

    if (CheckSelect(touch)) {
      e.stopPropagation();
      selected = true;
    }

    if (CheckLongSelect(touch)) {
      node.addEventListener('touchmove', CancelLongSelect);
      node.addEventListener('touchend', CancelLongSelect);
      node.addEventListener('touchcancel', CancelLongSelect);
      node.addEventListener('touchleave', CancelLongSelect);
      selected = true;
    }

    if (CheckMultiSelect(touch)) {
      node.addEventListener('touchmove', TouchMultiSelectDrag);
      node.addEventListener('touchend', CancelMultiSelect);
      node.addEventListener('touchcancel', CancelMultiSelect);
      node.addEventListener('touchleave', CancelMultiSelect);

      selectBoxAnchor = ToSVGPoint(touch, opts.svg.el);
      selected = true;
    }

    if (!selected) {
      opts.activeObjects.set({});
    }
  }

  function CancelMultiSelect() {
    // No select box was created and no element was selected.
    // Cancel any existing selection.
    if (!selectBox) {
      o.activeObjects.set({});
    }

    selectBox = false;
    selectBoxAnchor = null;

    clearTimeout(longPressHandle);
    longPressHandle = null;
    o.selectBox.set(null);

    window.removeEventListener('mousemove', MultiSelectDrag);
    window.removeEventListener('mouseup', CancelMultiSelect);
    node.removeEventListener('touchmove', TouchMultiSelectDrag);
    node.removeEventListener('touchend', CancelMultiSelect);
    node.removeEventListener('touchcancel', CancelMultiSelect);
    node.removeEventListener('touchleave', CancelMultiSelect);
  }

  function CancelLongSelect() {
    clearTimeout(longPressHandle);
    window.removeEventListener('mouseup', CancelLongSelect);
    window.removeEventListener('mousemove', CancelLongSelect);
    node.removeEventListener('touchmove', CancelLongSelect);
    node.removeEventListener('touchend', CancelLongSelect);
    node.removeEventListener('touchcancel', CancelLongSelect);
    node.removeEventListener('touchleave', CancelLongSelect);
  }

  node.addEventListener('touchstart', TouchStart);
  node.addEventListener('mousedown', MouseDown);

  return {
    destroy() {
      if (selectBoxAnchor) {
        CancelMultiSelect();
      }
      node.removeEventListener('mousedown', MouseDown);
      node.removeEventListener('touchstart', TouchStart);
    },

    update(opts: Opts) {
      o = opts;
    },
  };
}
